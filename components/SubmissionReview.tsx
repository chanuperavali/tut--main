
import React, { useState, useEffect, useRef } from 'react';
import { Assessment, Submission, FeedbackTag, Feedback } from '../types';
import { generateAiFeedback } from '../services/geminiService';

interface SubmissionReviewProps {
  assessment: Assessment;
  submission: Submission;
  tags: FeedbackTag[];
  onSubmit: (feedback: Partial<Feedback>) => void;
  onCancel: () => void;
}

const SubmissionReview: React.FC<SubmissionReviewProps> = ({
  assessment, submission, tags, onSubmit, onCancel
}) => {
  const [feedbackText, setFeedbackText] = useState('');
  const [modelAnswer, setModelAnswer] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [improvements, setImprovements] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedTone, setSelectedTone] = useState('Encouraging & Constructive');
  const [selectedLength, setSelectedLength] = useState<'Short' | 'Medium' | 'Long'>('Medium');
  const [step, setStep] = useState(1); // 1: Review, 2: Feedback, 3: Tags, 4: Confirm

  const startTime = useRef(Date.now());

  const handleAiGenerate = async () => {
    setIsAiLoading(true);
    try {
      const response = await generateAiFeedback(
        assessment.questions,
        submission.answers,
        assessment.rubric,
        selectedTone,
        selectedLength
      );
      setFeedbackText(response.feedback);
      setModelAnswer(response.modelAnswer || '');
      setImprovements(response.improvements);

      const matchedTagIds = tags
        .filter(t => response.suggestedTags.some(st =>
          st.toLowerCase().includes(t.name.toLowerCase()) ||
          t.name.toLowerCase().includes(st.toLowerCase())
        ))
        .map(t => t.id);

      setSelectedTags(matchedTagIds);
      setStep(2); // Jump to feedback step after generation
    } catch (err) {
      alert("AI Generation failed. Please try manual entry or check your API key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    const interactionTime = Math.round((Date.now() - startTime.current) / 1000);
    onSubmit({
      content: feedbackText,
      modelAnswer: modelAnswer,
      isAiGenerated: true,
      wasModified: true,
      tags: selectedTags,
      improvementSuggestions: improvements,
      interactionTime
    });
  };

  return (
    <div className="min-h-screen bg-palette-cream pb-32 flex flex-col">
      {/* Header */}
      <div className="px-5 py-6 flex items-center justify-between border-b border-palette-lightBeige sticky top-0 bg-palette-cream z-10">
        <button onClick={onCancel} className="text-palette-dark">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <div className="text-center">
          <h1 className="text-lg font-black text-palette-dark leading-none">Correction Lab</h1>
          <p className="text-[10px] font-bold text-palette-dark/70 mt-1 uppercase tracking-widest">Grading Workflow</p>
        </div>
        <div className="w-6 h-6"></div> {/* Spacer for balance */}
      </div>

      {/* Step Indicator */}
      <div className="px-10 py-8 flex items-center justify-between">
        {[
          { id: 1, label: 'REVIEW' },
          { id: 2, label: 'FEEDBACK' },
          { id: 3, label: 'TAGS' },
          { id: 4, label: 'CONFIRM' }
        ].map((s, i, arr) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-2">
              <div className={`w-4 h-4 rounded-full border-2 ${step >= s.id ? 'bg-palette-dark border-palette-dark shadow-sm' : 'bg-transparent border-palette-grey'}`}></div>
              <span className={`text-[8px] font-black uppercase tracking-widest ${step >= s.id ? 'text-palette-dark' : 'text-palette-grey'}`}>{s.label}</span>
            </div>
            {i < arr.length - 1 && <div className={`step-line ${step > s.id ? 'active' : ''}`}></div>}
          </React.Fragment>
        ))}
      </div>

      <div className="px-5 space-y-8 flex-1 overflow-y-auto no-scrollbar">
        {/* Student Submission Display */}
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-palette-dark uppercase tracking-wide">Student Submission</h3>
          <div className="bg-white rounded-3xl border border-palette-lightBeige custom-shadow overflow-hidden">
            <div className="p-6 space-y-6">
              {assessment.questions.map((q, idx) => (
                <div key={q.id} className="flex gap-3">
                  <div className="w-6 h-6 bg-palette-dark rounded-full flex items-center justify-center text-white text-[10px] font-black mt-0.5 flex-shrink-0">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <h4 className="text-sm font-black text-palette-dark leading-snug">{q.text}</h4>
                    <div className="p-4 bg-palette-cream rounded-2xl border border-palette-lightBeige text-sm italic font-medium text-palette-dark/80 leading-relaxed">
                      "{submission.answers[q.id]}"
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Feedback Editor */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-palette-dark uppercase tracking-wide">Instructor Preferences</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-palette-grey uppercase tracking-widest">Tone</label>
                <select
                  value={selectedTone}
                  onChange={(e) => setSelectedTone(e.target.value)}
                  className="w-full text-[11px] font-bold bg-white border border-palette-lightBeige rounded-xl px-3 py-2 outline-none text-palette-dark custom-shadow"
                >
                  <option>Encouraging & Constructive</option>
                  <option>Formal & Academic</option>
                  <option>Strict & Detailed</option>
                  <option>Socratic & Probing</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-palette-grey uppercase tracking-widest">Feedback Length</label>
                <select
                  value={selectedLength}
                  onChange={(e) => setSelectedLength(e.target.value as any)}
                  className="w-full text-[11px] font-bold bg-white border border-palette-lightBeige rounded-xl px-3 py-2 outline-none text-palette-dark custom-shadow"
                >
                  <option value="Short">Short (Concise)</option>
                  <option value="Medium">Medium (Balanced)</option>
                  <option value="Long">Long (Detailed)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-palette-lightBeige custom-shadow overflow-hidden">
            <div className="px-4 py-3 bg-palette-cream/50 border-b border-palette-lightBeige flex gap-4 text-palette-grey">
              <span className="text-[10px] font-black uppercase tracking-widest py-1">Overall Feedback</span>
              <div className="ml-auto flex items-center">
                {feedbackText && <div className="w-5 h-5 bg-palette-dark rounded-full flex items-center justify-center text-white"><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>}
              </div>
            </div>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Adjust preferences and generate AI feedback to begin..."
              className="w-full h-48 p-6 outline-none text-palette-dark font-medium leading-relaxed resize-none bg-white"
            />

            {/* Model Answer Section */}
            <div className="border-t border-palette-lightBeige">
              <div className="px-4 py-3 bg-palette-cream/50 border-b border-palette-lightBeige flex gap-4 text-palette-grey">
                <span className="text-[10px] font-black uppercase tracking-widest py-1">Model Answer (Ideal Response)</span>
              </div>
              <textarea
                value={modelAnswer}
                onChange={(e) => setModelAnswer(e.target.value)}
                placeholder="AI will generate a model answer here..."
                className="w-full h-32 p-6 outline-none text-palette-dark font-medium leading-relaxed resize-none bg-white"
              />
            </div>
            <div className="p-4 flex flex-wrap gap-2 border-t border-palette-lightBeige bg-palette-cream/30">
              {selectedTags.map(tid => {
                const tag = tags.find(t => t.id === tid);
                return (
                  <button
                    key={tid}
                    onClick={() => setSelectedTags(prev => prev.filter(id => id !== tid))}
                    className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-1 shadow-sm bg-palette-lightBeige text-palette-dark border border-palette-grey/20 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                  >
                    <span>🏷️</span>
                    {tag?.name}
                    <span>×</span>
                  </button>
                );
              })}

              <div className="relative">
                <button
                  onClick={() => {
                    // Toggle a simple dropdown or use a prompt for now if complex UI is overkill, 
                    // but let's do a simple inline select equivalent:
                    const unselectedTags = tags.filter(t => !selectedTags.includes(t.id));
                    if (unselectedTags.length === 0) {
                      alert("All available tags selected!");
                      return;
                    }
                    // For this rapid prototype, cycling or a browser native select is safest 
                    // to avoid layout issues, but let's try a custom styled overlay if possible, 
                    // or just a select that looks like a button.
                  }}
                  className="relative px-3 py-1.5 bg-white border border-palette-lightBeige text-palette-grey rounded-xl text-[10px] font-black uppercase shadow-sm hover:border-palette-dark transition-colors group"
                >
                  + Add Tag
                  <select
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        setSelectedTags(prev => [...prev, e.target.value]);
                      }
                    }}
                  >
                    <option value="">+ Add Tag</option>
                    {tags.filter(t => !selectedTags.includes(t.id)).map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.category})</option>
                    ))}
                  </select>
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleAiGenerate}
          disabled={isAiLoading}
          className="w-full py-5 bg-palette-dark text-white rounded-2xl font-black shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2"
        >
          {isAiLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M13 3l-1.5 3.5L8 8l3.5 1.5L13 13l1.5-3.5L18 8l-3.5-1.5z" /></svg>
          )}
          {feedbackText ? 'Regenerate Feedback' : 'Generate AI Feedback'}
        </button>
        <p className="text-center text-[9px] font-bold text-palette-grey italic uppercase tracking-widest">Powered by TutorIA Learning Model</p>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-24 left-0 right-0 px-5 flex gap-4">
        <button
          onClick={onCancel}
          className="w-16 h-16 bg-white border border-palette-lightBeige rounded-2xl flex items-center justify-center text-palette-dark custom-shadow hover:bg-palette-cream transition-colors"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
        <button
          onClick={handleFinalSubmit}
          disabled={!feedbackText}
          className="flex-1 h-16 bg-palette-dark text-white rounded-2xl font-black shadow-xl disabled:opacity-50 transition-all flex items-center justify-center gap-2"
        >
          Finalize & Send
          <svg className="w-6 h-6 rotate-45" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
        </button>
      </div>
    </div>
  );
};

export default SubmissionReview;
