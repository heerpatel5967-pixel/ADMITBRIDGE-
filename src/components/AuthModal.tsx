import React, { useState } from 'react';
import {
  Bookmark,
  Loader2,
  MessageSquare,
  PlusCircle,
  Target,
  UserCheck,
  X,
} from 'lucide-react';
import { AdmitBridgeLogo } from './AdmitBridgeLogo';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInGoogle: () => Promise<void>;
  onContinueAsGuest: () => void;
  promptReason?: 'general' | 'add-college' | 'shortlist';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSignInGoogle,
  onContinueAsGuest,
  promptReason = 'general',
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleClick = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await onSignInGoogle();
      onClose();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Unable to complete Google sign-in right now.';
      if (msg.includes('popup-closed-by-user')) {
        setErrorMsg('Sign-in popup was closed before completing. You can try again or continue as Guest.');
      } else if (msg.includes('popup-blocked')) {
        setErrorMsg('Browser blocked the sign-in popup. Please allow popups for this preview or continue as Guest.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const subtitle =
    promptReason === 'add-college'
      ? 'Sign in with Google to add or edit custom university brochure entries in your directory.'
      : promptReason === 'shortlist'
        ? 'Sign in with Google to save your shortlisted colleges and exam preferences across sessions.'
        : 'Sign in with Google to sync your shortlist, Chance Me score, and AI counsellor chats across sessions—or browse freely as a guest.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/50 dark:bg-black/75 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors"
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-[#EEF2FF]/70 via-white to-[#ECFDF5]/40 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
          <div>
            <div className="mb-3">
              <AdmitBridgeLogo size="md" showTagline />
            </div>
            <h2
              id="auth-modal-title"
              className="text-base font-semibold text-[#1E1B4B] dark:text-slate-100"
            >
              Student Account & Access
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close sign in modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            <div className="flex items-center gap-2.5">
              <Bookmark className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              <span>Save shortlisted colleges to your personal My Shortlist tab</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Target className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              <span>Persist your Chance Me exam, percentile, and Rajasthan domicile settings</span>
            </div>
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              <span>Keep AI Admissions Counsellor conversations synced across sessions</span>
            </div>
            <div className="flex items-center gap-2.5">
              <PlusCircle className="w-4 h-4 text-blue-700 dark:text-blue-400 shrink-0" />
              <span>Add and edit custom university brochure entries in your directory</span>
            </div>
          </div>

          {errorMsg && (
            <div className="text-xs text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg px-3.5 py-2.5 leading-relaxed">
              {errorMsg}
            </div>
          )}

          <div className="space-y-2.5 pt-1">
            <button
              type="button"
              onClick={handleGoogleClick}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold bg-slate-900 dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-60 transition-colors cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting Google Account...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.8-5.4 3.8-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.7 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z"
                    />
                  </svg>
                  <span>Sign in with Google</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                onContinueAsGuest();
                onClose();
              }}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <UserCheck className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Continue as Guest</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
