// Google Identity Services integration — loads Google's script on demand and
// exposes a promise-based way to get proof of the user's Google identity,
// which the caller POSTs to /api/auth/google for server-side verification.
// No passport/session machinery; stateless, matching the rest of this API.
declare global {
  interface Window {
    google?: any;
  }
}

// Public by design — Google client IDs are meant to be embedded in frontend
// code (only the client secret is sensitive, and that never leaves the
// backend .env). Keep in sync with GOOGLE_CLIENT_ID in the backend's .env.
export const GOOGLE_CLIENT_ID = '1026571458262-9pt43o4aj2ghlcmo82kfq4rie8inqlj1.apps.googleusercontent.com';

let scriptLoadPromise: Promise<void> | null = null;

const loadGoogleScript = (): Promise<void> => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptLoadPromise) return scriptLoadPromise;

  scriptLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In. Please try again.'));
    document.head.appendChild(script);
  });
  return scriptLoadPromise;
};

// Either shape is valid — the caller just JSON.stringifies whichever one
// comes back and POSTs it straight to /api/auth/google, which accepts both.
export type GoogleAuthResult = { credential: string } | { code: string };

// Opens Google's OAuth consent popup directly — deliberately NOT the One Tap
// prompt (accounts.id.prompt()). Two real problems ruled that out for a
// manually-clicked "Continue with Google" button:
//   1. Chrome/Google apply a "quiet period" cooldown to One Tap after it's
//      been dismissed a few times for this origin — after that, prompt()
//      silently reports "not displayed" with no UI ever shown at all.
//   2. Even falling back to this same popup FROM inside prompt()'s
//      notification callback doesn't work: that callback only fires after
//      an async FedCM round-trip, and by then the browser's "user
//      activation" from the original click has expired, so the popup
//      window.open() gets silently blocked — its callback never fires
//      either, and the whole thing just hangs until a timeout.
// Going straight to the popup keeps the click-to-window.open() chain as
// short as possible, preserving activation reliably.
export const requestGoogleAuth = (): Promise<GoogleAuthResult> => {
  return new Promise((resolve, reject) => {
    let settled = false;
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutId);
      fn();
    };

    // Safety net: if the popup is blocked outright, or the user closes it
    // without completing sign-in, older GIS versions never invoke `callback`
    // at all — this keeps that from hanging forever.
    const timeoutId = setTimeout(() => {
      settle(() => reject(new Error('Google sign-in timed out. Please try again.')));
    }, 20000);

    loadGoogleScript()
      .then(() => {
        const client = window.google!.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          ux_mode: 'popup',
          callback: (response: { code?: string; error?: string }) => {
            if (response?.code) settle(() => resolve({ code: response.code! }));
            else settle(() => reject(new Error('Google sign-in was cancelled.')));
          },
        });
        client.requestCode();
      })
      .catch((err) => settle(() => reject(err)));
  });
};
