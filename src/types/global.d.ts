
interface Window {
  google: {
    accounts: {
      id: {
        initialize: (config: any) => void;
        prompt: (callback: (notification: any) => void) => void;
        renderButton: (element: HTMLElement, options: any) => void;
      };
      oauth2: {
        initCodeClient: (config: any) => any;
      };
    };
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
