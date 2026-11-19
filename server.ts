import 'dotenv/config';
import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_MODEL = 'gemini-4-hydrogen';
const FALLBACK_MODEL = 'gemini-3.1-flash-lite';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add it in the Settings > Secrets panel.'
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function extractReadableErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  const trimmed = raw.trim();
  if (trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed) as {
        error?: { message?: string; status?: string; code?: number };
        message?: string;
      };
      if (parsed?.error?.message) return parsed.error.message;
      if (parsed?.message) return parsed.message;
    } catch {
      // Fall back to raw message
    }
  }
  return raw;
}

function isTransientOverloadError(err: unknown): boolean {
  const text = extractReadableErrorMessage(err).toLowerCase();
  const raw = (err instanceof Error ? err.message : String(err)).toLowerCase();
  const combined = `${text} ${raw}`;
  return (
    combined.includes('503') ||
    combined.includes('unavailable') ||
    combined.includes('high demand') ||
    combined.includes('overloaded') ||
    combined.includes('resource_exhausted') ||
    combined.includes('429') ||
    combined.includes('econnreset') ||
    combined.includes('etimedout')
  );
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withModelRetry<T>(
  operation: (modelName: string) => Promise<T>
): Promise<{ result: T; modelUsed: string }> {
  const attempts: Array<{ model: string; delayMs: number }> = [
    { model: PRIMARY_MODEL, delayMs: 0 },
    { model: PRIMARY_MODEL, delayMs: 500 },
    { model: FALLBACK_MODEL, delayMs: 300 },
    { model: FALLBACK_MODEL, delayMs: 900 },
  ];

  let lastError: unknown;
  for (const attempt of attempts) {
    if (attempt.delayMs > 0) {
      await sleep(attempt.delayMs);
    }
    try {
      const result = await operation(attempt.model);
      return { result, modelUsed: attempt.model };
    } catch (err) {
      lastError = err;
      if (!isTransientOverloadError(err)) {
        throw err;
      }
    }
  }
  throw lastError;
}

function formatApiError(err: unknown): { status: number; message: string } {
  const readable = extractReadableErrorMessage(err);
  const raw = err instanceof Error ? err.message : String(err);
  const lower = `${readable} ${raw}`.toLowerCase();

  if (lower.includes('api_key_invalid') || lower.includes('permission_denied') || lower.includes('403')) {
    return {
      status: 403,
      message:
        'Gemini API access was denied or the API key is invalid. Please verify GEMINI_API_KEY in Settings > Secrets.',
    };
  }
  if (lower.includes('503') || lower.includes('unavailable') || lower.includes('high demand') || lower.includes('overloaded')) {
    return {
      status: 503,
      message:
        'The AI service is temporarily experiencing high demand. Please retry in a few seconds.',
    };
  }
  if (lower.includes('resource_exhausted') || lower.includes('429')) {
    return {
      status: 429,
      message:
        'Gemini API rate limit or quota reached. Please wait a moment and try again, or check billing in Settings > Secrets.',
    };
  }
  if (lower.includes('not_found') || lower.includes('404')) {
    return {
      status: 404,
      message: `Requested Gemini model (${PRIMARY_MODEL}) was not found or is unavailable.`,
    };
  }
  if (lower.includes('gemini_api_key is not configured')) {
    return {
      status: 500,
      message: readable,
    };
  }
  return {
    status: 500,
    message: readable || 'Failed to communicate with Gemini AI service.',
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ ok: true, model: PRIMARY_MODEL, fallbackModel: FALLBACK_MODEL });
  });

  app.post('/api/counsellor', async (req: Request, res: Response) => {
    try {
      const { messages, colleges, activeFilters, scopeToFiltered } = req.body ?? {};

      if (!Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'Conversation messages array is required.' });
        return;
      }

      const ai = getGeminiClient();

      const compactColleges = Array.isArray(colleges)
        ? colleges.map((c: Record<string, unknown>) => ({
            id: c.id,
            name: c.name,
            city: c.city,
            state: c.state,
            type: c.type,
            portalUrl: c.portalUrl,
            ugCourses: c.ugCourses,
            pgCourses: c.pgCourses,
            entranceExams: c.entranceExams,
            feeRanges: c.feeRanges,
            placementHighlights: c.placementHighlights,
            scholarshipInfo: c.scholarshipInfo,
          }))
        : [];

      const serializedColleges = JSON.stringify(compactColleges, null, 2);
      const filterContext = activeFilters ? JSON.stringify(activeFilters) : 'None';

      const systemInstruction = `You are Admit Bridge's Senior Undergraduate & Postgraduate Admissions & ROI Counsellor for Indian students exploring both Undergraduate (B.Tech, BBA, BCA, B.Sc, B.Des, B.Arch, B.Com) and Postgraduate (M.Tech, MBA, MCA, M.Sc, M.Des, LLM) programs.

YOUR CORE EXPERTISE:
1. **UG & PG Pathways & Entrance Exams**:
   - Explain 10+2 to UG (B.Tech, B.S., Dual Degree, BCA, B.Sc, BBA, B.Des) and UG to PG (M.Tech, MBA, MCA, M.Sc, M.Des, LLM) eligibility pathways clearly.
   - **Highlight Core IIT & Govt Pathways Prominently**:
     - **JEE Advanced (via JoSAA)**: Primary UG entry route for IIT Bombay, IIT Delhi, IIT Madras, and IIT Jodhpur (B.Tech, B.S., and Dual Degree programs), requiring JEE Main qualification first; All-India merit with no Home State quota at IITs (unlike NITs such as MNIT Jaipur, which offer a 50% Home State quota via JEE Main + JoSAA).
     - **GATE (via COAP / CCMT)**: Primary PG M.Tech pathway — GATE + COAP counselling for IITs (IIT Bombay, IIT Delhi, IIT Madras, IIT Jodhpur) and GATE + CCMT counselling for MNIT Jaipur / NITs.
     - **IIT JAM (via JOAPS / CCMN)**: Primary PG M.Sc / Dual-Degree science pathway for IITs (JOAPS) and NITs like MNIT Jaipur (CCMN).
   - Also cover CAT (including IIT MBA schools such as SJMSOM IIT Bombay, DMS IIT Delhi, DoMS IIT Madras, and IIT Jodhpur MBA), JEE Main, MET, VITEEE, VITMEE, SRMJEEE, SET, SITEEE, SNAP, NPAT, NMIMS CET, NMAT, KCET, PESSAT, PGCET, CUET, JKDET, AMCAT, MAT, XAT, GMAT, and Merit-based routes.
2. **Quantitative ROI Analysis**:
   - Use the exact \`feeRanges.ugTotal\`, \`feeRanges.pgTotal\`, and \`placementHighlights\` from the live portal database below to compute payback efficiency and compare value across Government IITs, NIT (MNIT Jaipur), Autonomous Deemed, and Private institutions.
3. **Mandatory Official / Admission Portal Links**:
   - **CRITICAL**: Whenever you mention, recommend, or compare any institution from the database below, you MUST include its exact \`portalUrl\` formatted strictly as a Markdown link with the label \`[Official / Admission Portal](<portalUrl>)\` (e.g., \`[Official / Admission Portal](https://www.iitb.ac.in/)\`).
   - When generating a comparison Markdown table, include an \`Admission Portal\` column containing \`[Official / Admission Portal](<portalUrl>)\` for every row.

ACTIVE SIDEBAR FILTERS: ${filterContext}
USER SCOPE PREFERENCE: ${scopeToFiltered ? 'Prioritize institutions matching the active sidebar filters.' : 'Consider all institutions in the portal database.'}

LIVE PORTAL DATABASE JSON:
${serializedColleges}

FORMATTING GUIDELINES:
- Be direct, structured, and honest about fee vs. placement trade-offs.
- Always quote exact numbers from \`feeRanges\` and \`placementHighlights\`.
- Always include \`[Official / Admission Portal](<exact portalUrl>)\` for each referenced institution.`;

      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      const { result: stream } = await withModelRetry((model) =>
        ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
          },
        })
      );

      res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');

      for await (const chunk of stream) {
        const text = chunk.text;
        if (text) {
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
      res.end();
    } catch (err) {
      const { status, message } = formatApiError(err);
      if (!res.headersSent) {
        res.status(status).json({ error: message });
      } else {
        res.write(`data: ${JSON.stringify({ error: message })}\n\n`);
        res.end();
      }
    }
  });

  app.post('/api/parse-brochure', async (req: Request, res: Response) => {
    try {
      const { brochureText } = req.body ?? {};
      if (!brochureText || typeof brochureText !== 'string' || brochureText.trim().length < 20) {
        res.status(400).json({
          error: 'Please paste at least 20 characters of university brochure or prospectus text.',
        });
        return;
      }

      const ai = getGeminiClient();

      const { result: response } = await withModelRetry((model) =>
        ai.models.generateContent({
          model,
          contents: `Extract structured university admission information from the brochure text into the exact JSON schema.
Use clean formatting such as:
- type: e.g. "Private University", "Private / Deemed University", "Government (IIT)", "Government (NIT)"
- feeRanges.ugTotal: e.g. "₹19.9L – ₹21.5L" (or "N/A" if strictly PG)
- feeRanges.pgTotal: e.g. "₹10.8L – ₹11.5L" (or "N/A" if strictly UG)
- placementHighlights: e.g. "Avg ~₹18.5 LPA | Highest ~₹60.8 LPA"
- portalUrl: official admission URL if present in text, otherwise best official domain https:// URL or empty string.
- scholarshipInfo: concise summary of merit scholarships & percentile slabs if mentioned (e.g. "Merit Scholarship: 80% tuition waiver for 98%+ percentile; 40% waiver for 95%+ percentile"), or empty string if none mentioned.

BROCHURE TEXT:
${brochureText.slice(0, 15000)}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                city: { type: Type.STRING },
                state: { type: Type.STRING },
                type: { type: Type.STRING },
                portalUrl: { type: Type.STRING },
                ugCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
                pgCourses: { type: Type.ARRAY, items: { type: Type.STRING } },
                entranceExams: { type: Type.ARRAY, items: { type: Type.STRING } },
                feeRanges: {
                  type: Type.OBJECT,
                  properties: {
                    ugTotal: { type: Type.STRING },
                    pgTotal: { type: Type.STRING },
                  },
                  required: ['ugTotal', 'pgTotal'],
                },
                placementHighlights: { type: Type.STRING },
                scholarshipInfo: { type: Type.STRING },
              },
              required: [
                'name',
                'city',
                'state',
                'type',
                'portalUrl',
                'ugCourses',
                'pgCourses',
                'entranceExams',
                'feeRanges',
                'placementHighlights',
              ],
            },
          },
        })
      );

      const jsonText = (response.text ?? '{}').trim();
      const parsed = JSON.parse(jsonText);
      res.json({ college: parsed });
    } catch (err) {
      const { status, message } = formatApiError(err);
      res.status(status).json({ error: message });
    }
  });

  app.post('/api/compare-summary', async (req: Request, res: Response) => {
    try {
      const { colleges, chanceMeProfile } = req.body ?? {};
      if (!Array.isArray(colleges) || colleges.length < 2) {
        res.status(400).json({ error: 'Select 2 to 3 colleges to generate a comparison summary.' });
        return;
      }

      const ai = getGeminiClient();

      const compactColleges = colleges.slice(0, 3).map((c: Record<string, unknown>) => ({
        name: c.name,
        city: c.city,
        state: c.state,
        type: c.type,
        portalUrl: c.portalUrl,
        ugCourses: c.ugCourses,
        pgCourses: c.pgCourses,
        entranceExams: c.entranceExams,
        feeRanges: c.feeRanges,
        placementHighlights: c.placementHighlights,
        scholarshipInfo: c.scholarshipInfo,
      }));

      const profileLine =
        chanceMeProfile && String(chanceMeProfile.score || '').trim()
          ? `Student Profile: Exam = ${chanceMeProfile.exam}, Score/Percentile = ${chanceMeProfile.score}, Rajasthan Domicile = ${Boolean(chanceMeProfile.rajasthanDomicile)}`
          : 'Student Profile: General comparison (no specific exam score entered yet)';

      const { result: response } = await withModelRetry((model) =>
        ai.models.generateContent({
          model,
          contents: `Compare these ${compactColleges.length} Indian colleges and write a crisp, practical AI Recommendation Summary (150–220 words max).
${profileLine}

COLLEGES:
${JSON.stringify(compactColleges, null, 2)}

Structure your response with:
1. **Best Overall ROI Winner**: Which offers the fastest fee recovery and best package-to-fee value, citing exact \`feeRanges\` and \`placementHighlights\`.
2. **Who Should Choose Each**: 1 concise bullet per college explaining its strongest fit (exams, courses, or Rajasthan Domicile advantage if active).
3. **Direct Action**: Include each college's exact \`portalUrl\` formatted as \`[Official / Admission Portal](<portalUrl>)\`.`,
        })
      );

      res.json({ summary: (response.text ?? '').trim() });
    } catch (err) {
      const { status, message } = formatApiError(err);
      res.status(status).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Admit Bridge server running on http://localhost:${PORT}`);
  });
}

startServer();
