
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { UserService } from '../services/userService';

interface AuthSelectorProps {
  onSelect: (user: User) => void;
}

const AuthSelector: React.FC<AuthSelectorProps> = ({ onSelect }) => {
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Default mock emails handling for ease of testing if strict auth fails or if user wants to keep the "mock" feel but with DB
    // However, goal is "authenticate users are not storing", so we must use real auth.

    try {
      let userCredential;
      try {
        // Attempt login
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (loginError: any) {
        if (loginError.code === 'auth/user-not-found' || loginError.code === 'auth/invalid-credential') {
          // If login fails, try to create account (Auto-signup for demo purposes)
          // NOTE: In production, you'd likely want separate flows.
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } catch (signupError: any) {
            throw signupError; // Throw the signup error if that also fails
          }
        } else {
          throw loginError;
        }
      }

      const firebaseUser = userCredential.user;

      const appUser: User = {
        id: firebaseUser.uid,
        name: email.split('@')[0], // Simple name derivation
        email: email,
        role: activeRole!
      };

      // Store in Firestore
      try {
        await UserService.createUser(appUser);
      } catch (dbError: any) {
        console.error("Firestore Error Detailed:", dbError);
        // Check for permission denied
        if (dbError.code === 'permission-denied') {
          throw new Error("Database Permission Denied: Check your Firestore Security Rules.");
        }
        throw new Error("Failed to save user data: " + dbError.message);
      }

      onSelect(appUser);
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setActiveRole(null);
    setEmail('');
    setPassword('');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-palette-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[40px] custom-shadow overflow-hidden border border-palette-lightBeige transition-all duration-500">
        {!activeRole ? (
          <div className="p-10 space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="inline-flex w-20 h-20 bg-palette-dark rounded-3xl items-center justify-center text-white text-4xl font-black shadow-xl mb-6">T</div>
              <h1 className="text-3xl font-black text-palette-dark uppercase tracking-tighter">TutorIA</h1>
              <p className="text-palette-grey font-bold mt-2 uppercase tracking-[0.2em] text-[10px]">Portal Access System</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setActiveRole(UserRole.INSTRUCTOR)}
                className="w-full group p-6 bg-palette-cream/30 border border-palette-lightBeige rounded-3xl hover:border-palette-dark hover:bg-white transition-all text-left flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-black text-palette-dark uppercase tracking-widest">Instructor Portal</p>
                  <p className="text-[11px] text-palette-grey font-medium mt-1">Management & Analytics Console</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-palette-dark border border-palette-lightBeige group-hover:bg-palette-dark group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>

              <button
                onClick={() => setActiveRole(UserRole.STUDENT)}
                className="w-full group p-6 bg-palette-cream/30 border border-palette-lightBeige rounded-3xl hover:border-palette-dark hover:bg-white transition-all text-left flex items-center justify-between"
              >
                <div>
                  <p className="text-sm font-black text-palette-dark uppercase tracking-widest">Student Portal</p>
                  <p className="text-[11px] text-palette-grey font-medium mt-1">Submission & Feedback Hub</p>
                </div>
                <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center text-palette-dark border border-palette-lightBeige group-hover:bg-palette-dark group-hover:text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right-8 duration-500">
            <div className={`p-8 ${activeRole === UserRole.INSTRUCTOR ? 'bg-palette-dark' : 'bg-palette-grey'} text-white flex items-center gap-4`}>
              <button onClick={reset} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
              </button>
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight">
                  {activeRole === UserRole.INSTRUCTOR ? 'Instructor Login' : 'Student Login'}
                </h2>
                <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">Secure Credentials Required</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="p-10 space-y-6">
              {error && (
                <div className="p-3 bg-red-100 border border-red-200 text-red-600 text-xs rounded-lg">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-palette-grey uppercase tracking-widest px-1">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeRole === UserRole.INSTRUCTOR ? "sarah@university.edu" : "alex@student.edu"}
                    required
                    className="w-full p-4 bg-palette-cream/20 border border-palette-lightBeige rounded-2xl outline-none focus:border-palette-dark text-palette-dark font-medium transition-all"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-lightBeige">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206"></path></svg>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-palette-grey uppercase tracking-widest px-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full p-4 bg-palette-cream/20 border border-palette-lightBeige rounded-2xl outline-none focus:border-palette-dark text-palette-dark font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-palette-lightBeige hover:text-palette-grey transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs text-white shadow-xl transition-all flex items-center justify-center gap-3 ${activeRole === UserRole.INSTRUCTOR ? 'bg-palette-dark hover:bg-palette-dark/90 shadow-palette-dark/20' : 'bg-palette-grey hover:bg-palette-grey/90 shadow-palette-grey/20'
                  } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Authenticating...' : 'Authenticate'}
                {!loading && <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
              </button>

              <div className="pt-4 text-center">
                <button type="button" onClick={reset} className="text-[10px] font-black text-palette-grey hover:text-palette-dark uppercase tracking-widest">
                  Switch User Role
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <p className="fixed bottom-8 text-[9px] font-black text-palette-grey uppercase tracking-[0.4em]">
        Academic Environment • Version 1.0.4
      </p>
    </div>
  );
};

export default AuthSelector;
