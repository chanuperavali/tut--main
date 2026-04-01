
import React from 'react';
import { ChatMessage } from '../types';

interface HistoryViewProps {
    chatHistory: ChatMessage[];
}

const HistoryView: React.FC<HistoryViewProps> = ({ chatHistory }) => {
    return (
        <div className="p-6 max-w-4xl mx-auto space-y-6">
            <header className="mb-8">
                <h1 className="text-2xl font-black text-palette-dark uppercase tracking-tight">AI Interaction History</h1>
                <p className="text-xs font-bold text-palette-grey uppercase tracking-widest mt-2">Archives of your FAST AI sessions</p>
            </header>

            {chatHistory.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[32px] border border-palette-lightBeige border-dashed">
                    <div className="w-16 h-16 bg-palette-cream rounded-2xl mx-auto flex items-center justify-center text-palette-grey mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-palette-dark">No history recorded yet</p>
                    <p className="text-xs text-palette-grey mt-1">Start a conversation with Fast AI to see it here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Reverse mapping to show newest first if desired, but user asked for "ALL HISTORY", usually standard time order or newest at top. 
                Let's show standard chronological order as a log, or grouped by session? 
                For now, simple flat list of all messages.
            */}
                    {chatHistory.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-5 rounded-3xl text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user'
                                    ? 'bg-palette-dark text-white rounded-tr-sm'
                                    : 'bg-white text-palette-dark rounded-tl-sm border border-palette-lightBeige'
                                }`}>
                                <div className="flex items-center gap-2 mb-2 opacity-70">
                                    <span className="text-[9px] font-black uppercase tracking-widest">
                                        {msg.role === 'user' ? 'You' : 'TutorIA'}
                                    </span>
                                    <span className="text-[9px]">• {new Date(msg.timestamp).toLocaleString()}</span>
                                </div>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default HistoryView;
