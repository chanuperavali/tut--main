
import React from 'react';
import { User, UserRole } from '../types';

interface BottomNavProps {
  user: User;
  onLogout: () => void;
  onOpenChat: () => void;
  currentView: 'HOME' | 'HISTORY';
  onNavigate: (view: 'HOME' | 'HISTORY') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ user, onLogout, onOpenChat, currentView, onNavigate }) => {
  const isInstructor = user.role === UserRole.INSTRUCTOR;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-palette-lightBeige flex items-center justify-around px-2 py-3 z-50">
      <button
        onClick={() => onNavigate('HOME')}
        className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'HOME' ? 'text-palette-dark' : 'text-palette-grey hover:text-palette-dark'}`}
      >
        <svg className="w-6 h-6" fill={currentView === 'HOME' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={currentView === 'HOME' ? "0" : "2"} viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" /></svg>
        <span className="text-[10px] font-black uppercase tracking-tighter">{isInstructor ? 'Console' : 'Home'}</span>
      </button>

      <button
        onClick={() => onNavigate('HISTORY')}
        className={`flex flex-col items-center gap-1 transition-colors ${currentView === 'HISTORY' ? 'text-palette-dark' : 'text-palette-grey hover:text-palette-dark'}`}
      >
        <svg className="w-6 h-6" fill={currentView === 'HISTORY' ? "currentColor" : "none"} stroke="currentColor" strokeWidth={currentView === 'HISTORY' ? "0" : "2"} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        <span className="text-[10px] font-black uppercase tracking-tighter">History</span>
      </button>

      <button onClick={onOpenChat} className="flex flex-col items-center gap-1 text-palette-grey hover:text-palette-dark transition-colors">
        <div className="relative">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-palette-dark border-2 border-white rounded-full flex items-center justify-center">
            <svg className="w-1.5 h-1.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
        </div>
        <span className="text-[10px] font-black uppercase tracking-tighter">Fast AI</span>
      </button>

      <button onClick={onLogout} className="flex flex-col items-center gap-1 text-palette-grey hover:text-palette-dark transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        <span className="text-[10px] font-black uppercase tracking-tighter">Logout</span>
      </button>
    </div>
  );
};

export default BottomNav;
