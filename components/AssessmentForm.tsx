import React, { useState } from 'react';
import { Question, QuestionType } from '../types';

interface AssessmentFormProps {
  onSubmit: (title: string, questions: Question[], rubric: string) => void;
  onCancel: () => void;
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({ onSubmit, onCancel }) => {
  const [title, setTitle] = useState('');
  const [rubric, setRubric] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: 'q1', type: 'TEXT', text: '' }
  ]);

  const addQuestion = (type: QuestionType) => {
    setQuestions(prev => [
      ...prev,
      {
        id: `q${Date.now()}`,
        type,
        text: '',
        options: type === 'MCQ' ? ['', '', '', ''] : undefined
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    if (questions.length === 1) return; // Prevent removing the last question
    setQuestions(prev => prev.filter(q => q.id !== id));
  };

  const updateQuestionText = (id: string, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateOption = (qId: string, optionIndex: number, val: string) => {
    setQuestions(prev => prev.map(q => {
      if (q.id === qId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = val;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && questions.length > 0 && rubric) {
      onSubmit(title, questions, rubric);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-slate-900">Create New Assessment</h3>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Question Builder</p>
        </div>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Assessment Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none font-bold text-slate-800 placeholder:font-normal"
              placeholder="e.g., Final Physics Exam"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Grading Rubric / Instructor Context</label>
            <textarea
              rows={3}
              value={rubric}
              onChange={(e) => setRubric(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none text-sm"
              placeholder="Describe how the AI should grade this..."
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-black text-slate-800 text-sm uppercase">Questions ({questions.length})</h4>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => addQuestion('TEXT')}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-100 transition-colors flex items-center gap-1"
              >
                + Add Text
              </button>
              <button
                type="button"
                onClick={() => addQuestion('MCQ')}
                className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1"
              >
                + Add MCQ
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={q.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 relative group transition-all hover:bg-white hover:shadow-md hover:border-indigo-100">
                <span className="absolute left-6 top-6 w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-black text-slate-500">
                  {idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeQuestion(q.id)}
                  className="absolute right-4 top-4 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Question"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>

                <div className="pl-10 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${q.type === 'MCQ' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      }`}>
                      {q.type === 'MCQ' ? 'Multiple Choice' : 'Open Text'}
                    </span>
                  </div>

                  <input
                    type="text"
                    value={q.text}
                    onChange={(e) => updateQuestionText(q.id, e.target.value)}
                    className="w-full bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none pb-2 text-slate-800 font-bold placeholder:text-slate-300 transition-colors"
                    placeholder="Enter your question here..."
                    required
                  />

                  {q.type === 'MCQ' && q.options && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pl-2 border-l-2 border-emerald-100">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border-2 border-emerald-200 flex-shrink-0"></div>
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                            className="flex-1 bg-white px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-emerald-400 outline-none"
                            placeholder={`Option ${optIdx + 1}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 bg-white border border-slate-200 rounded-xl text-slate-600 font-bold hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-4 bg-indigo-600 rounded-xl text-white font-bold hover:bg-indigo-700 transition-colors shadow-xl shadow-indigo-100"
          >
            Launch Assessment
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssessmentForm;
