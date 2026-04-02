/** localStorage */
export const TOKEN_KEY = 'figview:token';

/** sessionStorage — post-load modal at most once per browser tab session */
export const SESSION_POST_LOAD_SEEN = 'figview:post-load-seen';
/** `'designs' | 'explore'` — last explicit choice; used when modal is skipped */
export const SESSION_POST_LOAD_PREF = 'figview:post-load-pref';

export function hasSeenPostLoadModal(): boolean {
  try {
    return sessionStorage.getItem(SESSION_POST_LOAD_SEEN) === '1';
  } catch {
    return false;
  }
}

export function markPostLoadModalSeen(choice: 'designs' | 'explore'): void {
  try {
    sessionStorage.setItem(SESSION_POST_LOAD_SEEN, '1');
    sessionStorage.setItem(SESSION_POST_LOAD_PREF, choice);
  } catch {
    /* private mode / quota */
  }
}

/** Maps stored pref to initial shell section (`explore` → dashboard home). */
export function readInitialAppSectionFromSession(): 'dashboard' | 'designs' {
  try {
    return sessionStorage.getItem(SESSION_POST_LOAD_PREF) === 'designs' ? 'designs' : 'dashboard';
  } catch {
    return 'dashboard';
  }
}
