
import React, { useState } from 'react';
import { summarizeResource } from '../services/geminiService';
import { User, Assessment, Submission, Feedback, SubmissionStatus, FeedbackTag, CourseResource } from '../types';

interface StudentDashboardProps {
  user: User;
  assessments: Assessment[];
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  feedbacks: Feedback[];
  resources: CourseResource[];
  tags: FeedbackTag[];
  onViewFeedback: (submissionId: string) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user, assessments, submissions, setSubmissions, feedbacks, resources, tags, onViewFeedback
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'COMPLETED' | 'RESOURCES'>('ACTIVE');
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);
  const [viewingPendingId, setViewingPendingId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [videoSummary, setVideoSummary] = useState<string | null>(null);
  const [resourceSummaries, setResourceSummaries] = useState<Record<string, string>>({});
  const [processingResourceIds, setProcessingResourceIds] = useState<string[]>([]);
  const [isSummarizing, setIsSummarizing] = useState(false);

  // ... (filters remain same)
  // Restoring logic:
  const pendingAssessments = assessments.filter(a =>
    !submissions.some(s => s.assessmentId === a.id && s.studentId === user.id)
  );

  const submittedPendingSubmissions = submissions.filter(s =>
    s.studentId === user.id && s.status === SubmissionStatus.PENDING
  );

  const gradedSubmissions = submissions.filter(s =>
    s.studentId === user.id && s.status === SubmissionStatus.REVIEWED
  );

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (!assessment) return;

    // Check if all questions are answered
    if (assessment.questions.some(q => !answers[q.id]?.trim())) {
      alert("Please answer all questions before submitting.");
      return;
    }

    const newSubmission: Submission = {
      id: `s_${Date.now()}`,
      assessmentId,
      studentId: user.id,
      studentName: user.name,
      answers: answers,
      status: SubmissionStatus.PENDING,
      submittedAt: new Date().toISOString()
    };

    setSubmissions(prev => [...prev, newSubmission]);
    setAnswers({});
    setSelectedAssessmentId(null);
  };

  // ... (handleSummarizeResource remains same)
  const handleSummarizeResource = async (r: CourseResource) => {
    if (processingResourceIds.includes(r.id)) return;

    setProcessingResourceIds(prev => [...prev, r.id]);
    try {
      const summary = await summarizeResource(r.title, r.url, r.type);
      setResourceSummaries(prev => ({ ...prev, [r.id]: summary }));
    } catch (e) {
      setResourceSummaries(prev => ({ ...prev, [r.id]: "Summary failed." }));
    } finally {
      setProcessingResourceIds(prev => prev.filter(id => id !== r.id));
    }
  };

  const renderActiveTab = () => {
    if (selectedAssessmentId) {
      const assessment = assessments.find(a => a.id === selectedAssessmentId);
      return (
        <div className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-2">
            <button onClick={() => setSelectedAssessmentId(null)} className="p-2 -ml-2 text-palette-dark hover:bg-palette-cream rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 className="text-lg font-black text-palette-dark uppercase tracking-wide">Submit Answer</h3>
          </div>

          <div className="space-y-8">
            {assessment?.questions.map((q, idx) => (
              <div key={q.id} className="space-y-3">
                <div className="p-4 bg-palette-cream/30 rounded-2xl border border-palette-lightBeige">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 bg-palette-dark text-white rounded-full flex items-center justify-center text-[10px] font-black">{idx + 1}</span>
                    <p className="text-xs font-black text-palette-grey uppercase">Question</p>
                  </div>
                  <p className="text-sm font-bold text-palette-dark leading-relaxed">
                    {q.text}
                  </p>
                </div>

                {q.type === 'MCQ' && q.options ? (
                  <div className="grid grid-cols-1 gap-3">
                    {q.options.map((opt, optIdx) => (
                      <label key={optIdx} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${answers[q.id] === opt
                        ? 'bg-indigo-50 border-indigo-200 shadow-sm'
                        : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${answers[q.id] === opt ? 'border-indigo-600' : 'border-slate-300'
                          }`}>
                          {answers[q.id] === opt && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full"></div>}
                        </div>
                        <input
                          type="radio"
                          name={`q_${q.id}`}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="hidden"
                        />
                        <span className={`text-sm font-bold ${answers[q.id] === opt ? 'text-indigo-900' : 'text-slate-700'}`}>{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full h-32 p-5 bg-palette-cream/10 border border-palette-lightBeige rounded-2xl outline-none text-palette-dark font-medium leading-relaxed resize-none focus:border-palette-dark transition-colors"
                  />
                )}
              </div>
            ))}
          </div>

          <button
            onClick={() => handleSubmit(selectedAssessmentId)}
            className="w-full py-4 bg-palette-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-palette-dark/10 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            Turn In Work
          </button>
        </div>
      );
    }

    if (viewingPendingId) {
      // (unchanged logic for pending view)
      const submission = submissions.find(s => s.id === viewingPendingId);
      const assessment = assessments.find(a => a.id === submission?.assessmentId);
      return (
        <div className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige space-y-6 animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-2">
            <button onClick={() => setViewingPendingId(null)} className="p-2 -ml-2 text-palette-dark hover:bg-palette-cream rounded-xl transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <h3 className="text-lg font-black text-palette-dark uppercase tracking-wide">Submission View</h3>
          </div>
          <div className="p-4 bg-palette-dark text-white rounded-2xl flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest">Status: Under AI & Instructor Review</span>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          </div>
          <div className="space-y-4">
            <div className="p-4 bg-palette-cream/30 rounded-2xl border border-palette-lightBeige">
              <p className="text-xs font-black text-palette-grey uppercase mb-1">Prompt</p>
              <p className="text-sm font-bold text-palette-dark leading-relaxed">{assessment?.question}</p>
            </div>
            <div className="p-4 bg-white rounded-2xl border border-palette-lightBeige">
              <p className="text-xs font-black text-palette-grey uppercase mb-2">Your Answers</p>
              <div className="space-y-4">
                {assessment?.questions.map((q, idx) => (
                  <div key={q.id}>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Q{idx + 1}: {q.text}</p>
                    <p className="text-sm font-medium text-palette-dark italic">"{submission?.answers[q.id]}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setViewingPendingId(null)}
            className="w-full py-4 bg-palette-lightBeige text-palette-dark rounded-2xl font-black uppercase tracking-widest text-xs border border-palette-grey/20 transition-all hover:bg-palette-cream"
          >
            Return to Dashboard
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Pending Tasks Section */}
        <section className="space-y-4">
          <h3 className="text-sm font-black text-palette-grey mb-4 uppercase tracking-[0.2em] px-1">To Do • Not Started</h3>
          {pendingAssessments.length > 0 ? (
            <div className="space-y-4">
              {pendingAssessments.map(a => (
                <div key={a.id} className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige space-y-4 hover:border-palette-dark transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <span className="bg-palette-cream text-palette-dark text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-palette-lightBeige">NEW ASSIGNMENT</span>
                    <div className="w-10 h-10 bg-palette-cream rounded-2xl flex items-center justify-center text-palette-dark">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-extrabold text-palette-dark">{a.title}</h4>
                    <p className="text-sm text-palette-grey font-medium uppercase tracking-widest line-clamp-1">
                      {a.questions.length} Question{a.questions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAssessmentId(a.id)}
                    className="w-full py-4 bg-palette-dark text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-palette-dark/10"
                  >
                    Open Exam
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-palette-cream/20 p-8 rounded-3xl border border-dashed border-palette-lightBeige text-center">
              <p className="text-palette-grey text-xs font-black uppercase tracking-widest">Everything turned in!</p>
            </div>
          )}
        </section>

        {/* Submitted/In Review Section (unchanged) */}
        {submittedPendingSubmissions.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-sm font-black text-palette-grey mb-4 uppercase tracking-[0.2em] px-1">Submitted • In Review</h3>
            <div className="space-y-4">
              {submittedPendingSubmissions.map(s => (
                <div key={s.id} className="bg-white p-5 rounded-3xl custom-shadow border border-palette-lightBeige border-l-4 border-l-palette-dark flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-palette-dark">{assessments.find(a => a.id === s.assessmentId)?.title}</h4>
                    <p className="text-[10px] font-black text-palette-grey uppercase tracking-widest mt-1">Submitted {new Date(s.submittedAt).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => setViewingPendingId(s.id)}
                    className="px-4 py-2 bg-palette-cream rounded-xl text-[10px] font-black uppercase tracking-widest text-palette-dark border border-palette-lightBeige hover:bg-palette-lightBeige transition-colors"
                  >
                    View Status
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Quick Feedback Snapshot (unchanged) */}
        {gradedSubmissions.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-black text-palette-grey uppercase tracking-[0.2em]">Latest Feedback</h3>
              <button onClick={() => setActiveTab('COMPLETED')} className="text-palette-dark text-[10px] font-black uppercase tracking-widest underline decoration-2 underline-offset-4">View All</button>
            </div>
            <div className="space-y-4">
              {gradedSubmissions.slice(0, 1).map(s => {
                const feedback = feedbacks.find(f => f.submissionId === s.id);
                if (!feedback) return null;
                return (
                  <div
                    key={s.id}
                    onClick={() => onViewFeedback(s.id)}
                    className="bg-white p-5 rounded-3xl custom-shadow border border-palette-lightBeige space-y-4 cursor-pointer hover:border-palette-dark transition-all group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-palette-cream text-palette-dark text-[10px] font-black uppercase px-2 py-1 rounded-lg border border-palette-lightBeige">GRADED</span>
                      <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full bg-palette-dark border-2 border-white flex items-center justify-center text-[10px] text-white font-black">AI</div>
                        <div className="w-8 h-8 rounded-full bg-palette-grey border-2 border-white flex items-center justify-center text-white overflow-hidden">
                          <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" alt="Instructor" />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-lg font-extrabold text-palette-dark group-hover:text-palette-dark transition-colors">{assessments.find(a => a.id === s.assessmentId)?.title}</h4>

                    <div className="p-4 bg-palette-cream/40 rounded-2xl border border-palette-lightBeige relative overflow-hidden">
                      <p className="text-xs text-palette-dark italic font-medium line-clamp-2">"{feedback.content}"</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    );
  };

  const renderResourcesTab = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h3 className="text-sm font-black text-palette-grey uppercase tracking-[0.2em] px-1">Learning Resources</h3>
        {resources.length === 0 ? (
          <div className="bg-white p-12 rounded-[40px] custom-shadow border border-palette-lightBeige text-center space-y-4">
            <p className="text-palette-grey text-xs font-black uppercase tracking-widest">No Resources Available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {resources.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige space-y-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xs uppercase">
                    {r.type === 'VIDEO' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    ) : (
                      <span>{r.type.substr(0, 3)}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-palette-dark text-lg">{r.title}</h4>
                    <p className="text-[10px] font-black text-palette-grey uppercase tracking-widest">
                      {r.type === 'VIDEO' ? 'WATCH VIDEO' : `DOWNLOAD ${r.type}`} • Posted {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {r.type === 'VIDEO' ? (
                  <div className="rounded-2xl overflow-hidden bg-black aspect-video relative group">
                    <video
                      src={r.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="p-8 bg-palette-cream/30 rounded-2xl border border-palette-lightBeige flex flex-col items-center justify-center gap-4 text-center">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                      {r.type === 'PDF' && <span className="text-2xl">📄</span>}
                      {r.type === 'IMAGE' && <span className="text-2xl">🖼️</span>}
                      {r.type === 'DOCUMENT' && <span className="text-2xl">📝</span>}
                      {r.type === 'SPREADSHEET' && <span className="text-2xl">📊</span>}
                      {r.type === 'OTHER' && <span className="text-2xl">📁</span>}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-palette-dark">Preview Not Available</p>
                      <p className="text-xs text-palette-grey">Download the file to view its contents.</p>
                    </div>
                    <a
                      href={r.url}
                      download={r.title}
                      target="_blank"
                      rel="noreferrer"
                      className="px-6 py-2 bg-palette-dark text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
                    >
                      Download File
                    </a>
                  </div>
                )}

                {/* Universal Summarize Button */}
                <button
                  onClick={() => handleSummarizeResource(r)}
                  disabled={processingResourceIds.includes(r.id)}
                  className="w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
                >
                  {processingResourceIds.includes(r.id) ? (
                    <>
                      <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                      Analyzing...
                    </>
                  ) : (
                    <>✨ Summarize {r.type} with AI</>
                  )}
                </button>

                {resourceSummaries[r.id] && (
                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-sm whitespace-pre-wrap animate-in fade-in">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Summary</span>
                      <button
                        onClick={() => setResourceSummaries(prev => {
                          const next = { ...prev };
                          delete next[r.id];
                          return next;
                        })}
                        className="text-indigo-400 hover:text-indigo-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    {resourceSummaries[r.id]}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderCompletedTab = () => {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <h3 className="text-sm font-black text-palette-grey uppercase tracking-[0.2em] px-1">Academic History</h3>
        {gradedSubmissions.length > 0 ? (
          <div className="space-y-4">
            {gradedSubmissions.map(s => {
              const assessment = assessments.find(a => a.id === s.assessmentId);
              const feedback = feedbacks.find(f => f.submissionId === s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => onViewFeedback(s.id)}
                  className="bg-white p-6 rounded-3xl custom-shadow border border-palette-lightBeige flex items-center gap-6 cursor-pointer hover:border-palette-dark transition-all"
                >
                  <div className="w-16 h-16 bg-palette-cream rounded-2xl flex items-center justify-center text-palette-dark flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-extrabold text-palette-dark leading-tight">{assessment?.title}</h4>
                    <p className="text-xs font-bold text-palette-grey mt-1">Reviewed on {new Date(feedback?.createdAt || '').toLocaleDateString()}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {feedback?.tags.slice(0, 2).map(tid => (
                        <span key={tid} className="bg-palette-lightBeige/50 text-palette-dark text-[9px] font-black px-2 py-0.5 rounded-md border border-palette-grey/10 uppercase tracking-tighter">
                          #{tags.find(t => t.id === tid)?.name.replace(/\s/g, '')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-palette-dark opacity-30">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-16 rounded-[40px] custom-shadow border border-palette-lightBeige text-center space-y-4">
            <div className="w-20 h-20 bg-palette-cream rounded-full flex items-center justify-center mx-auto text-palette-grey/40">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <p className="text-palette-dark font-black uppercase tracking-widest text-sm">No Graded Submissions</p>
              <p className="text-palette-grey text-xs font-medium mt-1">Your academic history will appear here once reviewed.</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="px-5 py-6 space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-[20px] bg-palette-beige overflow-hidden border-2 border-white shadow-md">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt="avatar" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-palette-dark leading-none tracking-tight">Hi, {user.name.split(' ')[0]}!</h2>
            <p className="text-[11px] font-black text-palette-grey uppercase tracking-[0.2em] mt-1.5">{pendingAssessments.length} Pending Exams</p>
          </div>
        </div>
        <button className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center text-palette-grey custom-shadow border border-palette-lightBeige hover:text-palette-dark transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
        </button>
      </div>

      {/* Navigation Tabs */}
      {!selectedAssessmentId && !viewingPendingId && (
        <div className="bg-palette-lightBeige/30 p-1.5 rounded-3xl flex border border-palette-lightBeige shadow-inner">
          <button
            onClick={() => { setActiveTab('ACTIVE'); }}
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${activeTab === 'ACTIVE' ? 'bg-white text-palette-dark shadow-sm' : 'text-palette-grey hover:text-palette-dark'
              }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('COMPLETED'); }}
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${activeTab === 'COMPLETED' ? 'bg-white text-palette-dark shadow-sm' : 'text-palette-grey hover:text-palette-dark'
              }`}
          >
            History
          </button>
          <button
            onClick={() => { setActiveTab('RESOURCES'); }}
            className={`flex-1 py-3.5 text-xs font-black uppercase tracking-widest rounded-2xl transition-all duration-300 ${activeTab === 'RESOURCES' ? 'bg-white text-palette-dark shadow-sm' : 'text-palette-grey hover:text-palette-dark'
              }`}
          >
            Resources
          </button>
        </div>
      )}

      {/* Tab Content */}
      <div className="pb-12">
        {activeTab === 'ACTIVE' && renderActiveTab()}
        {activeTab === 'COMPLETED' && renderCompletedTab()}
        {activeTab === 'RESOURCES' && renderResourcesTab()}
      </div>
    </div>
  );
};

export default StudentDashboard;
