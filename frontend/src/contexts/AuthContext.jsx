import { createContext, useContext, useEffect, useState } from 'react';
import { getMyProfile, sendOTP, verifyOTPCode } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Corresponds to the profile data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('pb_token');
      if (token) {
        try {
          const data = await getMyProfile();
          setUser(data.user);
        } catch (err) {
          console.error('Auth initialization failed:', err);
          localStorage.removeItem('pb_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginWithOTP = async (email) => {
    return await sendOTP(email);
  };

  const confirmOTP = async (email, otp, extraData = {}) => {
    const response = await verifyOTPCode({ email, otp, ...extraData });
    if (response.token) {
      localStorage.setItem('pb_token', response.token);
      setUser(response.user);
    }
    return response;
  };

  const logout = () => {
    localStorage.removeItem('pb_token');
    setUser(null);
  };

  const refreshProfile = async () => {
    try {
      const data = await getMyProfile();
      setUser(data.user);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile: user, // Alias for backward compatibility in components
      loading, 
      loginWithOTP, 
      confirmOTP, 
      logout, 
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
