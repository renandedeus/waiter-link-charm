
// This file is kept for backward compatibility
// It re-exports everything from the new structure
import { AuthContext, AuthProvider, useAuth } from './auth';
import type { AuthContextType } from './auth/types';

export { AuthContext, AuthProvider, useAuth };
export type { AuthContextType };
export default AuthContext;
