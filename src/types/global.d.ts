
interface Window {
  gapi: {
    load: (api: string, callback: () => void) => void;
    auth2: {
      init: (params: { client_id: string, scope: string }) => void;
      getAuthInstance: () => {
        signIn: (options?: { scope: string }) => Promise<{
          getAuthResponse: () => { access_token: string }
        }>;
        signOut: () => Promise<void>;
      };
    };
  };
}
