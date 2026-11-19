import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import {
  ChevronDown,
  Layers,
  Lock,
  LogIn,
  LogOut,
  MessageSquare,
  Moon,
  PanelRightClose,
  PanelRightOpen,
  Plus,
  SlidersHorizontal,
  Sun,
  X,
} from 'lucide-react';
import { AddCollegeModal } from './components/AddCollegeModal';
import { AdmitBridgeLogo } from './components/AdmitBridgeLogo';
import { AuthModal } from './components/AuthModal';
import { ChanceMeBar } from './components/ChanceMeBar';
import { CollegeDetailDrawer } from './components/CollegeDetailDrawer';
import { CompareDrawer } from './components/CompareDrawer';
import { ComparePanel } from './components/ComparePanel';
import { CounsellorPanel } from './components/CounsellorPanel';
import { DirectoryPanel, SortOption } from './components/DirectoryPanel';
import { HeroSearchBanner, QuickPresetId } from './components/HeroSearchBanner';
import { ShortlistPanel } from './components/ShortlistPanel';
import { SidebarFilters } from './components/SidebarFilters';
import { ToastContainer, ToastItem } from './components/ToastContainer';
import { PRELOADED_COLLEGES, normalizeCollegeEntry } from './data/colleges';
import { auth, googleProvider } from './firebase';
import {
  appendChatMessage,
  clearUserChats,
  deleteCustomCollegeDoc,
  ensureUserProfile,
  saveCustomCollege,
  saveUserPreferences,
  subscribeCustomColleges,
  subscribeUserChats,
  subscribeUserProfile,
} from './services/firestoreSync';
import { ActiveFilters, ChatMessage, CollegeRecord } from './types/college';
import {
  ChanceMeProfile,
  EligibilityResult,
  computeEligibilityTier,
  computeRoiMetrics,
} from './utils/admissions';

type WorkspaceTab = 'counsellor' | 'directory' | 'shortlist' | 'compare';
type ThemeMode = 'light' | 'dark';
type AuthPromptReason = 'general' | 'add-college' | 'shortlist';

const CUSTOM_COLLEGES_STORAGE_KEY = 'admitbridge_custom_colleges_v3';
const GUEST_SHORTLIST_STORAGE_KEY = 'admitbridge_guest_shortlist_v1';
const GUEST_CHANCE_ME_STORAGE_KEY = 'admitbridge_guest_chanceme_v1';
const THEME_STORAGE_KEY = 'admitbridge_theme_v1';

const INITIAL_FILTERS: ActiveFilters = {
  search: '',
  degreeLevels: [],
  locations: [],
  institutionTypes: [],
  programs: [],
};

const INITIAL_CHANCE_ME: ChanceMeProfile = {
  exam: 'JEE Main',
  score: '',
  rajasthanDomicile: false,
};

function isValidStoredCollege(item: unknown): item is CollegeRecord {
  if (!item || typeof item !== 'object') return false;
  const c = item as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.city === 'string' &&
    typeof c.type === 'string' &&
    Array.isArray(c.ugCourses) &&
    Array.isArray(c.pgCourses) &&
    Array.isArray(c.entranceExams) &&
    Boolean(c.feeRanges && typeof c.feeRanges === 'object')
  );
}

function loadGuestCustomColleges(): CollegeRecord[] {
  try {
    const saved = localStorage.getItem(CUSTOM_COLLEGES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter(isValidStoredCollege).map((entry) => {
          const normalized = normalizeCollegeEntry(entry, 'custom');
          normalized.addedAt = entry.addedAt;
          return normalized;
        });
      }
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function loadGuestShortlist(): string[] {
  try {
    const saved = localStorage.getItem(GUEST_SHORTLIST_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is string => typeof item === 'string').slice(0, 30);
      }
    }
  } catch {
    // Ignore storage errors
  }
  return [];
}

function loadGuestChanceMe(): ChanceMeProfile {
  try {
    const saved = localStorage.getItem(GUEST_CHANCE_ME_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<ChanceMeProfile>;
      if (parsed && typeof parsed === 'object') {
        return {
          exam:
            parsed.exam === 'JEE Main' ||
            parsed.exam === 'JEE Advanced' ||
            parsed.exam === 'GATE' ||
            parsed.exam === 'IIT JAM' ||
            parsed.exam === 'CAT' ||
            parsed.exam === 'CUET' ||
            parsed.exam === 'Merit'
              ? parsed.exam
              : 'JEE Main',
          score: typeof parsed.score === 'string' ? parsed.score.slice(0, 20) : '',
          rajasthanDomicile: Boolean(parsed.rajasthanDomicile),
        };
      }
    }
  } catch {
    // Ignore storage errors
  }
  return INITIAL_CHANCE_ME;
}

function getUserInitials(name?: string | null, email?: string | null): string {
  const source = (name || email || 'U').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {
      // Ignore storage errors
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth & Access State
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authPromptReason, setAuthPromptReason] = useState<AuthPromptReason>('general');
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  // Domain State
  const [customColleges, setCustomColleges] = useState<CollegeRecord[]>(loadGuestCustomColleges);
  const [shortlistIds, setShortlistIds] = useState<string[]>(loadGuestShortlist);
  const [chanceMeProfile, setChanceMeProfile] =
    useState<ChanceMeProfile>(loadGuestChanceMe);
  const [filters, setFilters] = useState<ActiveFilters>(INITIAL_FILTERS);
  const [activePreset, setActivePreset] = useState<QuickPresetId>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [isFiltering, setIsFiltering] = useState(false);

  const [activeTab, setActiveTab] = useState<WorkspaceTab>('directory');
  const [splitCounsellorOpen, setSplitCounsellorOpen] = useState(true);
  const [floatingCounsellorOpen, setFloatingCounsellorOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [inspectedCollege, setInspectedCollege] = useState<CollegeRecord | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<CollegeRecord | null>(null);
  const [compareDrawerOpen, setCompareDrawerOpen] = useState(false);

  const [selectedCompareIds, setSelectedCompareIds] = useState<string[]>([
    'muj-jaipur',
    'lnmiit-jaipur',
    'mnit-jaipur',
  ]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // Refs to avoid stale closures & circular snapshot loops
  const lastRequestRef = useRef<{ prompt: string; scopeToFiltered: boolean } | null>(null);
  const isStreamingRef = useRef(false);
  const profileReadyRef = useRef(false);
  const skipChanceMeSyncRef = useRef(false);
  const latestChanceMeRef = useRef(chanceMeProfile);
  const latestShortlistRef = useRef(shortlistIds);
  const prevUidRef = useRef<string | null>(null);
  const startAuthCheckedRef = useRef(false);
  const filterPulseTimerRef = useRef<number | null>(null);

  useEffect(() => {
    isStreamingRef.current = isStreaming;
  }, [isStreaming]);

  useEffect(() => {
    latestChanceMeRef.current = chanceMeProfile;
  }, [chanceMeProfile]);

  useEffect(() => {
    latestShortlistRef.current = shortlistIds;
  }, [shortlistIds]);

  const pushToast = useCallback(
    (
      message: string,
      options?: {
        variant?: 'success' | 'info';
        actionLabel?: string;
        onAction?: () => void;
      }
    ) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [
        ...prev.slice(-2),
        {
          id,
          message,
          variant: options?.variant ?? 'success',
          actionLabel: options?.actionLabel,
          onAction: options?.onAction,
        },
      ]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3000);
    },
    []
  );

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const triggerFilterPulse = useCallback(() => {
    if (filterPulseTimerRef.current) {
      window.clearTimeout(filterPulseTimerRef.current);
    }
    setIsFiltering(true);
    filterPulseTimerRef.current = window.setTimeout(() => {
      setIsFiltering(false);
    }, 150);
  }, []);

  // Close account dropdown on outside click or Escape
  useEffect(() => {
    if (!accountMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(e.target as Node)
      ) {
        setAccountMenuOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setAccountMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [accountMenuOpen]);

  // Firebase Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (nextUser) => {
      const previousUid = prevUidRef.current;
      prevUidRef.current = nextUser?.uid ?? null;
      setAvatarLoadError(false);

      if (!nextUser && previousUid) {
        profileReadyRef.current = false;
        setMessages([]);
        setShortlistIds(loadGuestShortlist());
        setChanceMeProfile(loadGuestChanceMe());
        setCustomColleges(loadGuestCustomColleges());
      }

      setUser(nextUser);
      setAuthReady(true);

      if (!startAuthCheckedRef.current) {
        startAuthCheckedRef.current = true;
        if (!nextUser) {
          setAuthPromptReason('general');
          setAuthModalOpen(true);
        }
      }
    });
    return () => unsub();
  }, []);

  // Cloud Firestore real-time listeners when authenticated
  useEffect(() => {
    if (!authReady || !user) {
      profileReadyRef.current = false;
      return;
    }

    let cancelled = false;
    let unsubProfile: (() => void) | undefined;
    let unsubChats: (() => void) | undefined;
    let unsubColleges: (() => void) | undefined;

    const initUserSync = async () => {
      const initialProfile = await ensureUserProfile(user, {
        chanceMeProfile: latestChanceMeRef.current,
        shortlistIds: latestShortlistRef.current,
      });
      if (cancelled) return;

      skipChanceMeSyncRef.current = true;
      setChanceMeProfile(initialProfile.chanceMeProfile);
      setShortlistIds(initialProfile.shortlistIds);
      profileReadyRef.current = true;

      unsubProfile = subscribeUserProfile(user.uid, (profile) => {
        skipChanceMeSyncRef.current = true;
        setChanceMeProfile(profile.chanceMeProfile);
        setShortlistIds(profile.shortlistIds);
      });

      unsubChats = subscribeUserChats(user.uid, (remoteMessages) => {
        if (!isStreamingRef.current) {
          setMessages(remoteMessages);
        }
      });

      unsubColleges = subscribeCustomColleges(
        user.uid,
        user.email,
        (remoteColleges) => {
          setCustomColleges(remoteColleges);
        }
      );
    };

    void initUserSync();

    return () => {
      cancelled = true;
      profileReadyRef.current = false;
      unsubProfile?.();
      unsubChats?.();
      unsubColleges?.();
    };
  }, [authReady, user]);

  // Persist guest data to localStorage when signed out
  useEffect(() => {
    if (user) return;
    try {
      localStorage.setItem(CUSTOM_COLLEGES_STORAGE_KEY, JSON.stringify(customColleges));
    } catch {
      // Ignore storage errors
    }
  }, [customColleges, user]);

  useEffect(() => {
    if (user) return;
    try {
      localStorage.setItem(GUEST_SHORTLIST_STORAGE_KEY, JSON.stringify(shortlistIds));
    } catch {
      // Ignore storage errors
    }
  }, [shortlistIds, user]);

  useEffect(() => {
    if (user) return;
    try {
      localStorage.setItem(GUEST_CHANCE_ME_STORAGE_KEY, JSON.stringify(chanceMeProfile));
    } catch {
      // Ignore storage errors
    }
  }, [chanceMeProfile, user]);

  // Debounced Firestore sync for Chance Me preferences when signed in
  useEffect(() => {
    if (!user || !profileReadyRef.current) return;
    if (skipChanceMeSyncRef.current) {
      skipChanceMeSyncRef.current = false;
      return;
    }

    const timer = window.setTimeout(() => {
      void saveUserPreferences(user.uid, { chanceMeProfile });
    }, 450);

    return () => window.clearTimeout(timer);
  }, [chanceMeProfile, user]);

  const canManageColleges = Boolean(user);

  const allColleges = useMemo(
    () => [...customColleges, ...PRELOADED_COLLEGES],
    [customColleges]
  );

  const eligibilityByCollege = useMemo(() => {
    const map = new Map<string, EligibilityResult>();
    for (const college of allColleges) {
      const result = computeEligibilityTier(college, chanceMeProfile);
      if (result) {
        map.set(college.id, result);
      }
    }
    return map;
  }, [allColleges, chanceMeProfile]);

  const filteredColleges = useMemo(() => {
    const q = filters.search.trim().toLowerCase();

    return allColleges.filter((college) => {
      if (filters.degreeLevels.length > 0) {
        const matchesLevel = filters.degreeLevels.some((lvl) =>
          college.degreeLevels.includes(lvl)
        );
        if (!matchesLevel) return false;
      }

      if (filters.locations.length > 0) {
        const matchesLocation = filters.locations.some((loc) =>
          college.locationTags.includes(loc)
        );
        if (!matchesLocation) return false;
      }

      if (filters.institutionTypes.length > 0) {
        const matchesType = filters.institutionTypes.some((type) =>
          college.institutionTypeTags.includes(type)
        );
        if (!matchesType) return false;
      }

      if (filters.programs.length > 0) {
        const matchesProg = filters.programs.some((prog) =>
          college.programs.includes(prog)
        );
        if (!matchesProg) return false;
      }

      if (activePreset === 'iits') {
        const isIit =
          college.type.toLowerCase().includes('iit') ||
          college.name.toLowerCase().includes('indian institute of technology');
        if (!isIit) return false;
      }

      if (activePreset === 'high-roi') {
        const roi = computeRoiMetrics(college, 'ALL');
        if (roi.primary.paybackYears > 1.7) return false;
      }

      if (q) {
        const searchable = [
          college.name,
          college.shortName,
          college.city,
          college.state,
          college.type,
          college.portalUrl,
          ...college.degreeLevels,
          ...college.programs,
          ...college.ugCourses,
          ...college.pgCourses,
          ...college.entranceExams,
          college.feeRanges.ugTotal,
          college.feeRanges.pgTotal,
          college.placementHighlights,
        ]
          .join(' ')
          .toLowerCase();
        if (!searchable.includes(q)) return false;
      }

      return true;
    });
  }, [allColleges, filters, activePreset]);

  const shortlistColleges = useMemo(
    () =>
      shortlistIds
        .map((id) => allColleges.find((c) => c.id === id))
        .filter((c): c is CollegeRecord => Boolean(c)),
    [shortlistIds, allColleges]
  );

  const activeFilterCount =
    filters.degreeLevels.length +
    filters.locations.length +
    filters.institutionTypes.length +
    filters.programs.length +
    (filters.search.trim() ? 1 : 0);

  const handleSelectPreset = (preset: QuickPresetId) => {
    setActivePreset(preset);
    triggerFilterPulse();

    if (preset === 'all') {
      setFilters((prev) => ({
        ...prev,
        locations: [],
        institutionTypes: [],
      }));
      setSortBy('default');
    } else if (preset === 'jaipur') {
      setFilters((prev) => ({
        ...prev,
        locations: ['Jaipur'],
        institutionTypes: [],
      }));
      setSortBy('default');
    } else if (preset === 'iits') {
      setFilters((prev) => ({
        ...prev,
        locations: [],
        institutionTypes: [],
      }));
      setSortBy('default');
    } else if (preset === 'govt') {
      setFilters((prev) => ({
        ...prev,
        locations: [],
        institutionTypes: ['Government/NIT/IIT'],
      }));
      setSortBy('default');
    } else if (preset === 'private') {
      setFilters((prev) => ({
        ...prev,
        locations: [],
        institutionTypes: ['Private University'],
      }));
      setSortBy('default');
    } else if (preset === 'high-roi') {
      setFilters((prev) => ({
        ...prev,
        locations: [],
        institutionTypes: [],
      }));
      setSortBy('payback-asc');
    }

    if (activeTab !== 'directory') {
      setActiveTab('directory');
    }
  };

  const handleSidebarFiltersChange = (next: ActiveFilters) => {
    setFilters(next);
    if (
      next.locations.length === 1 &&
      next.locations[0] === 'Jaipur' &&
      next.institutionTypes.length === 0
    ) {
      setActivePreset('jaipur');
    } else if (
      next.institutionTypes.length === 1 &&
      next.institutionTypes[0] === 'Government/NIT/IIT' &&
      next.locations.length === 0
    ) {
      setActivePreset('govt');
    } else if (
      next.institutionTypes.length === 1 &&
      next.institutionTypes[0] === 'Private University' &&
      next.locations.length === 0
    ) {
      setActivePreset('private');
    } else if (activePreset !== 'high-roi' && activePreset !== 'iits') {
      setActivePreset('all');
    }
  };

  const handleResetFilters = () => {
    triggerFilterPulse();
    setFilters(INITIAL_FILTERS);
    setActivePreset('all');
    setSortBy('default');
  };

  const handleSignInGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
  };

  const handleSignOut = async () => {
    setAccountMenuOpen(false);
    await signOut(auth);
  };

  const handleToggleCompare = (id: string) => {
    const college = allColleges.find((c) => c.id === id);
    const label = college?.shortName || 'College';

    setSelectedCompareIds((prev) => {
      const exists = prev.includes(id);
      const next = exists
        ? prev.filter((item) => item !== id)
        : prev.length >= 3
          ? [...prev.slice(1), id]
          : [...prev, id];

      if (exists) {
        pushToast(`Removed ${label} from Compare`, { variant: 'info' });
      } else {
        pushToast(`Added ${label} to Compare (${next.length}/3)`, {
          variant: 'success',
          actionLabel: next.length >= 2 ? 'Compare Now' : undefined,
          onAction: next.length >= 2 ? () => setCompareDrawerOpen(true) : undefined,
        });
      }
      return next;
    });
  };

  const handleAddCompareId = (id: string) => {
    setSelectedCompareIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  };

  const handleToggleShortlist = (id: string) => {
    const college = allColleges.find((c) => c.id === id);
    const label = college?.shortName || 'College';
    const prev = latestShortlistRef.current;
    const isRemoving = prev.includes(id);
    const next = isRemoving
      ? prev.filter((item) => item !== id)
      : [id, ...prev].slice(0, 30);

    setShortlistIds(next);

    if (isRemoving) {
      pushToast(`Removed ${label} from My Shortlist`, { variant: 'info' });
    } else {
      pushToast(`Saved ${label} to My Shortlist`, {
        variant: 'success',
        actionLabel: 'View Shortlist',
        onAction: () => setActiveTab('shortlist'),
      });
    }

    if (user && profileReadyRef.current) {
      void saveUserPreferences(user.uid, { shortlistIds: next });
    }
  };

  const handleRequestAddCollege = () => {
    if (!canManageColleges) {
      setAuthPromptReason('add-college');
      setAuthModalOpen(true);
      return;
    }
    setEditingCollege(null);
    setAddModalOpen(true);
  };

  const handleRequestEditCollege = (college: CollegeRecord) => {
    if (!canManageColleges) {
      setAuthPromptReason('add-college');
      setAuthModalOpen(true);
      return;
    }
    setEditingCollege(college);
    setAddModalOpen(true);
  };

  const handleSaveCollege = async (
    savedCollege: CollegeRecord,
    isEditExistingCustom: boolean
  ) => {
    if (user) {
      const persisted = await saveCustomCollege(
        user.uid,
        savedCollege,
        isEditExistingCustom
      );
      setInspectedCollege(persisted);
      pushToast(
        isEditExistingCustom
          ? `Updated ${persisted.shortName}`
          : `Added ${persisted.shortName} to directory`
      );
      return;
    }

    setCustomColleges((prev) => {
      if (isEditExistingCustom) {
        return prev.map((item) => (item.id === savedCollege.id ? savedCollege : item));
      }
      return [savedCollege, ...prev];
    });
    setInspectedCollege(savedCollege);
  };

  const handleDeleteCustomCollege = async (id: string) => {
    setSelectedCompareIds((prev) => prev.filter((cid) => cid !== id));
    if (user) {
      await deleteCustomCollegeDoc(id);
      pushToast('Removed custom college entry', { variant: 'info' });
      return;
    }
    setCustomColleges((prev) => prev.filter((c) => c.id !== id));
  };

  const sendCounsellorMessage = async (
    promptText: string,
    scopeToFiltered: boolean,
    isRetry = false
  ) => {
    if (isStreaming) return;

    lastRequestRef.current = { prompt: promptText, scopeToFiltered };

    const nowMs = Date.now();
    const userMsg: ChatMessage = {
      id: `user-${nowMs}`,
      role: 'user',
      content: promptText,
      timestamp: new Date(nowMs).toISOString(),
    };

    const assistantId = `assistant-${nowMs + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(nowMs + 1).toISOString(),
    };

    const baseHistory = isRetry
      ? messages.filter((m) => !m.isError)
      : [...messages.filter((m) => !m.isError), userMsg];

    const payloadMessages = baseHistory.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    setMessages([...baseHistory, assistantPlaceholder]);
    setIsStreaming(true);

    const activeUser = user;
    if (activeUser && !isRetry) {
      void (async () => {
        if (!profileReadyRef.current) {
          await ensureUserProfile(activeUser, {
            chanceMeProfile: latestChanceMeRef.current,
            shortlistIds: latestShortlistRef.current,
          });
          profileReadyRef.current = true;
        }
        await appendChatMessage(
          activeUser.uid,
          userMsg.id,
          'user',
          userMsg.content,
          nowMs
        );
      })();
    }

    try {
      const collegesContext =
        scopeToFiltered && filteredColleges.length > 0 ? filteredColleges : allColleges;

      const response = await fetch('/api/counsellor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          colleges: collegesContext,
          activeFilters: filters,
          scopeToFiltered,
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Unable to reach the AI Admissions Counsellor.';
        try {
          const errJson = await response.json();
          if (errJson?.error) errorMsg = errJson.error;
        } catch {
          // Ignore non-JSON error body
        }
        throw new Error(errorMsg);
      }

      if (!response.body) {
        throw new Error('Streaming response body unavailable.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulatedText = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const event of events) {
          const lines = event.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const rawJson = line.slice(6).trim();
            if (!rawJson) continue;
            let parsed: { text?: string; error?: string; done?: boolean } | null = null;
            try {
              parsed = JSON.parse(rawJson);
            } catch {
              continue;
            }
            if (parsed?.error) {
              throw new Error(parsed.error);
            }
            if (parsed?.text) {
              accumulatedText += parsed.text;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: accumulatedText } : m
                )
              );
            }
          }
        }
      }

      if (!accumulatedText.trim()) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  isError: true,
                  content: 'No response text was returned. Please retry your query.',
                }
              : m
          )
        );
      } else if (activeUser) {
        await appendChatMessage(
          activeUser.uid,
          assistantId,
          'assistant',
          accumulatedText,
          nowMs + 1
        );
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred.';
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isError: true, content: errorMessage } : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleClearChat = async () => {
    setMessages([]);
    if (user) {
      await clearUserChats(user.uid);
    }
  };

  const handleRetryLast = () => {
    if (!lastRequestRef.current || isStreaming) return;
    const { prompt, scopeToFiltered } = lastRequestRef.current;
    sendCounsellorMessage(prompt, scopeToFiltered, true);
  };

  const handleAskAiAboutCollege = (college: CollegeRecord) => {
    if (activeTab !== 'counsellor') {
      if (window.innerWidth >= 1280) {
        setSplitCounsellorOpen(true);
      } else {
        setFloatingCounsellorOpen(true);
      }
    }
    sendCounsellorMessage(
      `Give me a complete Undergraduate & Postgraduate admissions and ROI analysis for ${college.name} (${college.city}, ${college.state}). Cover UG courses (${college.ugCourses.join(', ')}), PG courses (${college.pgCourses.join(', ')}), UG total fees (${college.feeRanges.ugTotal}), PG total fees (${college.feeRanges.pgTotal}), accepted entrance exams (${college.entranceExams.join(', ')}), placement highlights (${college.placementHighlights}), and include the Official / Admission Portal link (${college.portalUrl}).`,
      false
    );
  };

  const handleRunAiComparison = (collegesToCompare: CollegeRecord[]) => {
    const names = collegesToCompare.map((c) => c.shortName).join(', ');
    setActiveTab('counsellor');
    sendCounsellorMessage(
      `Compare ${names} side-by-side for both Undergraduate and Postgraduate admissions. Include a Markdown table comparing UG & PG courses, UG & PG total fees, accepted entrance exams, placement highlights, and an Admission Portal column with each college's Official / Admission Portal link, followed by a clear ROI recommendation.`,
      false
    );
  };

  const selectedCompareColleges = selectedCompareIds
    .map((id) => allColleges.find((c) => c.id === id))
    .filter((c): c is CollegeRecord => Boolean(c));

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Student';
  const firstName = displayName.split(/\s+/)[0];

  const showSplitViewCounsellor =
    (activeTab === 'directory' || activeTab === 'shortlist') && splitCounsellorOpen;

  return (
    <div className="h-screen flex flex-col bg-[#F4F7FC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden transition-colors">
      {/* Subtle Top Indigo-Blue-Emerald Accent Strip in Light Mode */}
      <div className="h-0.5 w-full bg-gradient-to-r from-[#1E1B4B] via-[#2563EB] to-[#0D9488] shrink-0" />
      {/* Top Navigation Bar — Linear/Stripe 3-Zone Contract */}
      <header className="h-14 shrink-0 bg-white/95 dark:bg-slate-900 border-b border-[#DCE4F2] dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-6 z-30 transition-colors">
        {/* Zone 1: Brand Wordmark + Mobile Filters */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#DCE4F2] dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-[#EEF2FF] dark:hover:bg-slate-800 cursor-pointer whitespace-nowrap shrink-0"
            aria-label="Open filters"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
            </span>
          </button>

          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('directory');
            }}
            aria-label="Admit Bridge Home"
            className="inline-flex items-center whitespace-nowrap shrink-0 focus:outline-none group"
          >
            <AdmitBridgeLogo size="sm" />
          </a>
        </div>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Workspace sections"
          className="flex items-center gap-2 sm:gap-3 h-full overflow-x-auto scrollbar-thin"
        >
          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'directory'
                ? 'bg-[#EEF2FF] text-[#2563EB] dark:bg-slate-800 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-[#1E1B4B] dark:hover:text-slate-100'
            }`}
          >
            College Directory ({filteredColleges.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shortlist')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'shortlist'
                ? 'bg-[#EEF2FF] text-[#2563EB] dark:bg-slate-800 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-[#1E1B4B] dark:hover:text-slate-100'
            }`}
          >
            My Shortlist ({shortlistColleges.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('counsellor')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'counsellor'
                ? 'bg-[#EEF2FF] text-[#2563EB] dark:bg-slate-800 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-[#1E1B4B] dark:hover:text-slate-100'
            }`}
          >
            AI Counsellor
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'compare'
                ? 'bg-[#EEF2FF] text-[#2563EB] dark:bg-slate-800 dark:text-blue-300 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-[#1E1B4B] dark:hover:text-slate-100'
            }`}
          >
            Compare & ROI ({selectedCompareIds.length}/3)
          </button>
        </nav>

        {/* Zone 3: Theme Toggle, Split Toggle, Add College Data & Auth */}
        <div className="flex items-center gap-2 shrink-0">
          {(activeTab === 'directory' || activeTab === 'shortlist') && (
            <button
              type="button"
              onClick={() => setSplitCounsellorOpen((prev) => !prev)}
              title={
                splitCounsellorOpen
                  ? 'Hide Split-View AI Counsellor'
                  : 'Open Split-View AI Counsellor'
              }
              className={`hidden xl:inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                splitCounsellorOpen
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-[#2563EB]/40 dark:border-blue-700 text-[#2563EB] dark:text-blue-300'
                  : 'bg-white dark:bg-slate-800 border-[#E2E8F0] dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {splitCounsellorOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
              <span>AI Split</span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden 2xl:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-slate-600" />
                <span className="hidden 2xl:inline">Dark</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleRequestAddCollege}
            title={
              canManageColleges
                ? 'Add College Data from Brochure'
                : 'Sign in with Google to add or edit college entries'
            }
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              canManageColleges
                ? 'bg-[#2563EB] text-white hover:bg-blue-700'
                : 'bg-[#F8FAFC] dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-[#E2E8F0] dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {canManageColleges ? (
              <Plus className="w-4 h-4" />
            ) : (
              <Lock className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Add College Data</span>
            <span className="sm:hidden">Add</span>
          </button>

          {user ? (
            <div ref={accountMenuRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setAccountMenuOpen((prev) => !prev)}
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
                className="inline-flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-lg border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {user.photoURL && !avatarLoadError ? (
                  <img
                    src={user.photoURL}
                    alt={displayName}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarLoadError(true)}
                    className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-600"
                  />
                ) : (
                  <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white text-xs font-semibold flex items-center justify-center">
                    {getUserInitials(user.displayName, user.email)}
                  </span>
                )}
                <span className="hidden sm:inline text-xs font-semibold text-[#1E1B4B] dark:text-slate-100 max-w-[110px] truncate">
                  {firstName}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {accountMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-700 rounded-xl shadow-xl py-2 z-50"
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="text-sm font-semibold text-[#1E1B4B] dark:text-slate-100 truncate">
                      {displayName}
                    </div>
                    {user.email && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {user.email}
                      </div>
                    )}
                  </div>

                  <div className="px-2 py-1.5 space-y-1">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setAccountMenuOpen(false);
                        setActiveTab('shortlist');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    >
                      My Shortlist ({shortlistColleges.length})
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setAuthPromptReason('general');
                setAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-[#1E1B4B] dark:bg-slate-800 text-white hover:bg-indigo-950 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </header>

      {/* Compact Hero + Instant Search + Quick Pills (shown on Directory & Shortlist) */}
      {(activeTab === 'directory' || activeTab === 'shortlist') && (
        <HeroSearchBanner
          searchQuery={filters.search}
          onSearchChange={(val) => setFilters((prev) => ({ ...prev, search: val }))}
          activePreset={activePreset}
          onSelectPreset={handleSelectPreset}
          totalMatching={allColleges.length}
          onOpenMobileFilters={() => setMobileSidebarOpen(true)}
        />
      )}

      {/* 'Chance Me' Eligibility Bar */}
      <ChanceMeBar
        profile={chanceMeProfile}
        onChange={setChanceMeProfile}
        eligibilityByCollege={eligibilityByCollege}
        showViewDirectoryAction={activeTab !== 'directory'}
        onViewDirectory={() => setActiveTab('directory')}
      />

      {/* Main Workspace Split */}
      <div className="flex-1 flex min-h-0 overflow-hidden relative">
        <SidebarFilters
          colleges={allColleges}
          filteredColleges={filteredColleges}
          filters={filters}
          onChangeFilters={handleSidebarFiltersChange}
          onResetFilters={handleResetFilters}
          selectedCompareIds={selectedCompareIds}
          onToggleCompare={handleToggleCompare}
          onInspectCollege={setInspectedCollege}
          mobileOpen={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          eligibilityByCollege={eligibilityByCollege}
        />

        <main className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
          <div className="flex-1 min-h-0 overflow-hidden flex">
            <div className="flex-1 min-w-0 h-full overflow-hidden">
              {activeTab === 'counsellor' && (
                <CounsellorPanel
                  allColleges={allColleges}
                  filteredColleges={filteredColleges}
                  filters={filters}
                  messages={messages}
                  isStreaming={isStreaming}
                  onSendMessage={(text, scoped) => sendCounsellorMessage(text, scoped)}
                  onClearChat={handleClearChat}
                  onRetryLast={handleRetryLast}
                />
              )}

              {activeTab === 'directory' && (
                <DirectoryPanel
                  colleges={filteredColleges}
                  filters={filters}
                  selectedCompareIds={selectedCompareIds}
                  onToggleCompare={handleToggleCompare}
                  shortlistIds={shortlistIds}
                  onToggleShortlist={handleToggleShortlist}
                  onInspectCollege={setInspectedCollege}
                  onOpenCompareDrawer={() => setCompareDrawerOpen(true)}
                  onResetFilters={handleResetFilters}
                  eligibilityByCollege={eligibilityByCollege}
                  sortBy={sortBy}
                  onChangeSortBy={setSortBy}
                  isFiltering={isFiltering}
                />
              )}

              {activeTab === 'shortlist' && (
                <ShortlistPanel
                  colleges={shortlistColleges}
                  selectedCompareIds={selectedCompareIds}
                  onToggleCompare={handleToggleCompare}
                  onToggleShortlist={handleToggleShortlist}
                  onInspectCollege={setInspectedCollege}
                  onOpenCompareDrawer={() => setCompareDrawerOpen(true)}
                  onBrowseDirectory={() => setActiveTab('directory')}
                  eligibilityByCollege={eligibilityByCollege}
                  isAuthenticated={Boolean(user)}
                  onOpenSignIn={() => {
                    setAuthPromptReason('shortlist');
                    setAuthModalOpen(true);
                  }}
                />
              )}

              {activeTab === 'compare' && (
                <ComparePanel
                  allColleges={allColleges}
                  selectedIds={selectedCompareIds}
                  onToggleCompare={handleToggleCompare}
                  onAddCompareId={handleAddCompareId}
                  onInspectCollege={setInspectedCollege}
                  onRunAiComparison={handleRunAiComparison}
                />
              )}
            </div>

            {/* Clean Split-View AI Counsellor Right Panel on XL Desktop */}
            {showSplitViewCounsellor && (
              <aside
                aria-label="Split-view AI Admissions Counsellor"
                className="hidden xl:flex w-[360px] shrink-0 h-full border-l border-[#E2E8F0] dark:border-slate-800 flex-col overflow-hidden"
              >
                <CounsellorPanel
                  allColleges={allColleges}
                  filteredColleges={filteredColleges}
                  filters={filters}
                  messages={messages}
                  isStreaming={isStreaming}
                  onSendMessage={(text, scoped) => sendCounsellorMessage(text, scoped)}
                  onClearChat={handleClearChat}
                  onRetryLast={handleRetryLast}
                  compact
                  onClosePanel={() => setSplitCounsellorOpen(false)}
                />
              </aside>
            )}
          </div>

          {/* Compact Multi-College Compare Drawer Tray */}
          {selectedCompareColleges.length >= 2 && !compareDrawerOpen && (
            <div className="bg-[#EEF4FF] dark:bg-slate-900 border-t border-[#DCE4F2] dark:border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0 transition-colors">
              <div className="flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-thin">
                <span className="text-xs font-semibold text-[#1E1B4B] dark:text-slate-200 whitespace-nowrap">
                  Selected ({selectedCompareColleges.length}/3):
                </span>
                {selectedCompareColleges.map((c) => (
                  <span
                    key={c.id}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-white dark:bg-slate-800 text-[#1E1B4B] dark:text-slate-200 border border-[#C7D2FE] dark:border-slate-700 whitespace-nowrap"
                  >
                    <span>{c.shortName}</span>
                    <button
                      type="button"
                      onClick={() => handleToggleCompare(c.id)}
                      className="text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer"
                      aria-label={`Unselect ${c.shortName}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedCompareIds([])}
                  className="px-2.5 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer whitespace-nowrap"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setCompareDrawerOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] text-white hover:bg-blue-700 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Open Compare Drawer</span>
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating 'Ask AI Counsellor' Button on Smaller Screens (or when split-view collapsed) */}
      {activeTab !== 'counsellor' && !floatingCounsellorOpen && (
        <button
          type="button"
          onClick={() => setFloatingCounsellorOpen(true)}
          className={`${
            showSplitViewCounsellor ? 'xl:hidden' : ''
          } fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-semibold bg-[#2563EB] text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20 hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI Counsellor</span>
        </button>
      )}

      {/* Floating Slide-Over AI Counsellor Drawer Widget */}
      {floatingCounsellorOpen && activeTab !== 'counsellor' && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-900/45 dark:bg-black/70 backdrop-blur-[1px]"
            onClick={() => setFloatingCounsellorOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-[#E2E8F0] dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
            <CounsellorPanel
              allColleges={allColleges}
              filteredColleges={filteredColleges}
              filters={filters}
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={(text, scoped) => sendCounsellorMessage(text, scoped)}
              onClearChat={handleClearChat}
              onRetryLast={handleRetryLast}
              compact
              onClosePanel={() => setFloatingCounsellorOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Multi-College Compare Drawer */}
      <CompareDrawer
        isOpen={compareDrawerOpen}
        onClose={() => setCompareDrawerOpen(false)}
        allColleges={allColleges}
        selectedIds={selectedCompareIds}
        onToggleCompare={handleToggleCompare}
        onAddCompareId={handleAddCompareId}
        onInspectCollege={setInspectedCollege}
        chanceMeProfile={chanceMeProfile}
        eligibilityByCollege={eligibilityByCollege}
      />

      {/* College Detail Drawer */}
      <CollegeDetailDrawer
        college={inspectedCollege}
        onClose={() => setInspectedCollege(null)}
        isCompared={
          inspectedCollege ? selectedCompareIds.includes(inspectedCollege.id) : false
        }
        onToggleCompare={handleToggleCompare}
        isShortlisted={
          inspectedCollege ? shortlistIds.includes(inspectedCollege.id) : false
        }
        onToggleShortlist={handleToggleShortlist}
        onAskAiAboutCollege={handleAskAiAboutCollege}
        onDeleteCustomCollege={handleDeleteCustomCollege}
        canManageColleges={canManageColleges}
        onEditCollege={handleRequestEditCollege}
        eligibility={
          inspectedCollege ? eligibilityByCollege.get(inspectedCollege.id) ?? null : null
        }
        chanceMeProfile={chanceMeProfile}
      />

      {/* Add / Edit College Brochure Modal */}
      <AddCollegeModal
        isOpen={addModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setEditingCollege(null);
        }}
        onSaveCollege={handleSaveCollege}
        editingCollege={editingCollege}
      />

      {/* Google Sign-In & Continue as Guest Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSignInGoogle={handleSignInGoogle}
        onContinueAsGuest={() => setAuthModalOpen(false)}
        promptReason={authPromptReason}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
