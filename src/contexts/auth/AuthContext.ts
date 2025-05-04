
import { createContext } from 'react';
import { AuthContextType } from './types';

const defaultAuthContext: AuthContextType = {
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  checkAdminStatus: async () => false,
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export default AuthContext;
