
/**
 * Helper functions for Google integration
 */

/**
 * Decodes a JWT token and returns the payload
 */
export const parseJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return {};
  }
};

/**
 * Loads the Google API script if not already loaded
 */
export const loadGoogleScript = (): void => {
  if (document.querySelector('script[src*="accounts.google.com/gsi/client"]')) {
    return;
  }
  
  const script = document.createElement('script');
  script.src = 'https://accounts.google.com/gsi/client';
  script.async = true;
  script.defer = true;
  document.body.appendChild(script);
};

/**
 * Google Client ID
 */
export const GOOGLE_CLIENT_ID = "609592535220-k8apdmmab6asaotegvprhsb2dturjoqv.apps.googleusercontent.com";
