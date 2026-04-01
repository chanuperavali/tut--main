
import React from 'react';
import { Feedback, Submission, FeedbackTag } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalyticsViewProps {
   feedbacks: Feedback[];
   submissions: Submission[];
   tags: FeedbackTag[];
   onBack: () => void;
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ feedbacks, submissions, tags, onBack }) => {
   // 1. Calculate AI Adoption
   const aiAdoption = feedbacks.length > 0
      ? Math.round((feedbacks.filter(f => f.isAiGenerated).length / feedbacks.length) * 100)
      : 0;

   // 2. Calculate Average Word Count
   const avgWds = feedbacks.length > 0
      ? Math.round(feedbacks.reduce((acc, f) => acc + (f.content?.split(' ').length || 0), 0) / feedbacks.length)
      : 0;

   // 3. Calculate Trend Data (Last 4 Weeks - simplified to last 4 feedbacks for demo or groupings)
   // For this prototype, we'll map the last 4 feedbacks to "Recent Activity" 
   // or just static buckets if we don't have enough history.
   // Let's make it smarter: Group by date (simple approach) or just show last 4 items.
   const trendData = feedbacks.slice(-4).map((f, i) => ({
      name: `T-${4 - i}`,
      ai: f.isAiGenerated ? 100 : 0,
      manual: f.isAiGenerated ? 0 : 100
   }));

   // If no data, show placeholder trends
   const safeTrendData = trendData.length > 0 ? trendData : [
      { name: 'No Data', ai: 0, manual: 0 }
   ];

   // 4. Get Recent Submissions with Status
   const recentSubmissions = submissions
      .slice()
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
      .slice(0, 5)
      .map(sub => {
         const feedback = feedbacks.find(f => f.submissionId === sub.id);
         const isGraded = !!feedback;
         const status = isGraded ? (feedback.isAiGenerated ? 'AI APPROVED' : 'GRADED') : 'PENDING';
         const color = isGraded ? 'text-emerald-600 bg-emerald-50' : 'text-amber-700 bg-amber-50';

         // Calculate "time ago"
         const hoursAgo = Math.floor((Date.now() - new Date(sub.submittedAt).getTime()) / (1000 * 60 * 60));
         const timeLabel = hoursAgo < 1 ? 'Just now' : `${hoursAgo}h ago`;

         return {
            id: sub.id,
            name: sub.studentName,
            title: `Submission • ${timeLabel}`,
            status,
            color,
            score: isGraded ? 'Completed' : 'Pending'
         };
      });

   return (
      <div className="px-5 py-6 space-y-8 animate-in fade-in duration-500 pb-32">
         {/* Header */}
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-2xl bg-indigo-100 overflow-hidden border-2 border-white shadow-sm">
                  <img src="https://api.dicebear.com/7.x/avataaars/svg?seed= Sarah" alt="Sarah" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">TUTORIA RESEARCH</p>
                  <h2 className="text-xl font-extrabold text-slate-900">Analytics</h2>
               </div>
            </div>
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-400 custom-shadow hover:bg-slate-50">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
         </div>

         {/* Top Cards */}
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 custom-shadow space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Adoption</p>
               <h3 className="text-3xl font-black text-indigo-600">{aiAdoption}%</h3>
               <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px]">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 15l7-7 7 7" /></svg>
                  Live
               </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 custom-shadow space-y-3">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Length</p>
               <h3 className="text-3xl font-black text-slate-900">{avgWds} wds</h3>
               <div className="flex items-center gap-1 text-slate-400 font-bold text-[10px]">
                  per feedback
               </div>
            </div>
         </div>

         {/* Charts Section */}
         <div className="bg-white p-8 rounded-[40px] border border-slate-100 custom-shadow space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h4 className="text-lg font-black text-slate-900">Feedback Usage</h4>
                  <p className="text-xs font-bold text-slate-400">Last 4 Items</p>
               </div>
               <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                     <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                     <span className="text-[10px] font-black text-slate-400">AI</span>
                  </div>
                  <div className="flex items-center gap-1">
                     <div className="w-2.5 h-2.5 rounded-full bg-slate-100"></div>
                     <span className="text-[10px] font-black text-slate-400">Manual</span>
                  </div>
               </div>
            </div>
            <div className="h-48 w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={safeTrendData}>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94A3B8' }} />
                     <Bar dataKey="ai" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={12} />
                     <Bar dataKey="manual" fill="#F1F5F9" radius={[4, 4, 0, 0]} barSize={12} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Recent Submissions */}
         <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
               <h4 className="text-lg font-black text-slate-900">Recent Activity</h4>
            </div>

            <div className="space-y-4">
               {recentSubmissions.length === 0 ? (
                  <p className="text-center text-slate-400 text-sm">No activity yet.</p>
               ) : (
                  recentSubmissions.map(sub => (
                     <div key={sub.id} className="bg-white p-5 rounded-3xl border border-slate-100 custom-shadow flex items-center gap-4 transition-all hover:border-indigo-100">
                        <div className="w-14 h-14 rounded-full bg-indigo-50 border-2 border-white flex items-center justify-center text-indigo-600 font-black text-lg">
                           {sub.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 space-y-0.5">
                           <h5 className="font-black text-slate-900">{sub.name}</h5>
                           <p className="text-[11px] font-bold text-slate-400">{sub.title}</p>
                        </div>
                        <div className="text-right space-y-1.5">
                           <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-tighter ${sub.color}`}>{sub.status}</span>
                           <p className="text-[11px] font-black text-slate-300 tracking-tighter">{sub.score}</p>
                        </div>
                     </div>
                  ))
               )}
            </div>
         </div>

         {/* Night Mode Toggle Overlay (Visual parity with screenshot) */}
         <div className="fixed bottom-32 right-6">
            <button className="w-14 h-14 bg-white custom-shadow rounded-full flex items-center justify-center text-slate-900 border border-slate-50">
               <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            </button>
         </div>
      </div>
   );
};

export default AnalyticsView;
