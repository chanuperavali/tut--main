
import React from 'react';
import { Feedback, Submission, Assessment, FeedbackTag } from '../types';

interface FeedbackDetailsProps {
  feedback: Feedback;
  submission: Submission;
  assessment: Assessment;
  tags: FeedbackTag[];
  onBack: () => void;
}

const FeedbackDetails: React.FC<FeedbackDetailsProps> = ({
  feedback, submission, assessment, tags, onBack
}) => {
  return (
    <div className="min-h-screen bg-palette-cream pb-32">
      {/* Header */}
      <div className="bg-white px-5 py-6 flex items-center justify-between sticky top-0 z-10 border-b border-palette-lightBeige">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center text-palette-dark hover:bg-palette-cream rounded-xl transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h1 className="text-lg font-black text-palette-dark uppercase tracking-tight">Feedback Insight</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-5 space-y-8">
        {/* Original Question */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-palette-dark rounded-full flex items-center justify-center text-white text-[10px]">?</div>
            <h3 className="text-base font-extrabold text-palette-dark uppercase tracking-wide">Original Prompt</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige">
            <p className="text-palette-dark font-medium leading-relaxed">{assessment.question}</p>
          </div>
        </div>

        {/* Your Answer */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-palette-dark" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
            <h3 className="text-base font-extrabold text-palette-dark uppercase tracking-wide">Your Submission</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige space-y-3">
            <p className="text-[11px] font-bold text-palette-grey italic">Final Version</p>
            <p className="text-palette-dark font-medium leading-relaxed">
              {submission.answer}
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {feedback.tags.map(tid => {
            const tag = tags.find(t => t.id === tid);
            if (!tag) return null;
            return (
              <span key={tid} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase border bg-palette-lightBeige text-palette-dark border-palette-grey/20 shadow-sm">
                <span className="w-4 h-4 rounded-full flex items-center justify-center bg-white/50">✓</span>
                {tag.name}
              </span>
            );
          })}
        </div>

        {/* AI Feedback */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-palette-dark rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <h3 className="text-base font-extrabold text-palette-dark uppercase tracking-wide">Feedback Analysis</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige ai-border">
            <p className="text-palette-dark font-medium leading-relaxed">
              {feedback.content}
            </p>
          </div>
        </div>

        {/* Model Answer */}
        {feedback.modelAnswer && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-palette-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="text-base font-extrabold text-palette-dark uppercase tracking-wide">Model Answer / Ideal Approach</h3>
            </div>
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100">
              <p className="text-palette-dark font-medium leading-relaxed">
                {feedback.modelAnswer}
              </p>
            </div>
          </div>
        )}

        {/* Improvement Suggestions */}
        {feedback.improvementSuggestions.length > 0 && (
          <div className="bg-white p-6 rounded-3xl border-2 border-palette-dark space-y-4 shadow-xl">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-palette-dark" fill="currentColor" viewBox="0 0 20 20"><path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3z"></path></svg>
              <h3 className="text-base font-extrabold text-palette-dark uppercase tracking-wide">Actionable Steps</h3>
            </div>
            <div className="space-y-4">
              {feedback.improvementSuggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-palette-dark rounded-full flex-shrink-0 flex items-center justify-center text-white text-[11px] font-black">{i + 1}</div>
                  <p className="text-sm font-bold text-palette-dark leading-snug">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button className="flex-1 py-4 bg-palette-dark text-white rounded-2xl font-black shadow-xl hover:opacity-90 transition-all uppercase tracking-widest text-xs">
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackDetails;
