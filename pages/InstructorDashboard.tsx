
import React, { useState } from 'react';
import { User, Assessment, Submission, Feedback, SubmissionStatus, FeedbackTag, CourseResource, Question } from '../types';
import AssessmentForm from '../components/AssessmentForm';
import SubmissionReview from '../components/SubmissionReview';
import AnalyticsView from '../components/AnalyticsView';
import TagManager from '../components/TagManager';

interface InstructorDashboardProps {
  user: User;
  assessments: Assessment[];
  setAssessments: React.Dispatch<React.SetStateAction<Assessment[]>>;
  submissions: Submission[];
  setSubmissions: React.Dispatch<React.SetStateAction<Submission[]>>;
  feedbacks: Feedback[];
  setFeedbacks: React.Dispatch<React.SetStateAction<Feedback[]>>;
  resources: CourseResource[];
  setResources: React.Dispatch<React.SetStateAction<CourseResource[]>>;
  tags: FeedbackTag[];
  onUpdateTags: (tags: FeedbackTag[]) => void;
}

const InstructorDashboard: React.FC<InstructorDashboardProps> = ({
  user, assessments, setAssessments, submissions, setSubmissions, feedbacks, setFeedbacks, resources, setResources, tags, onUpdateTags
}) => {
  const [view, setView] = useState<'LIST' | 'CREATE' | 'REVIEW' | 'ANALYTICS' | 'TAGS' | 'RESOURCES'>('LIST');
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [activeSubmission, setActiveSubmission] = useState<Submission | null>(null);

  const createAssessment = (title: string, questions: Question[], rubric: string) => {
    const newAssessment: Assessment = {
      id: `a${Date.now()}`,
      instructorId: user.id,
      title,
      questions,
      rubric,
      createdAt: new Date().toISOString()
    };
    setAssessments(prev => [...prev, newAssessment]);
    setView('LIST');
  };

  const handleReview = (submission: Submission) => {
    setActiveSubmission(submission);
    setActiveAssessment(assessments.find(a => a.id === submission.assessmentId) || null);
    setView('REVIEW');
  };

  const submitFeedback = (feedbackData: Partial<Feedback>) => {
    if (!activeSubmission) return;

    const newFeedback: Feedback = {
      id: `f${Date.now()}`,
      submissionId: activeSubmission.id,
      instructorId: user.id,
      content: feedbackData.content || '',
      isAiGenerated: !!feedbackData.isAiGenerated,
      wasModified: !!feedbackData.wasModified,
      tags: feedbackData.tags || [],
      improvementSuggestions: feedbackData.improvementSuggestions || [],
      interactionTime: feedbackData.interactionTime || 0,
      createdAt: new Date().toISOString()
    };

    setFeedbacks(prev => [...prev, newFeedback]);
    setSubmissions(prev => prev.map(s =>
      s.id === activeSubmission.id ? { ...s, status: SubmissionStatus.REVIEWED } : s
    ));
    setView('LIST');
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Instructor Console</h2>
          <p className="text-slate-500">Welcome back, {user.name.split(' ')[0]}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setView('TAGS')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border ${view === 'TAGS' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
            Manage Tags
          </button>
          <button
            onClick={() => setView('ANALYTICS')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border ${view === 'ANALYTICS' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            Analytics
          </button>
          <button
            onClick={() => setView('RESOURCES')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 border ${view === 'RESOURCES' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Resources
          </button>
          <button
            onClick={() => setView('CREATE')}
            className="px-4 py-2 bg-indigo-600 rounded-lg text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            New Assessment
          </button>
        </div>
      </div>

      {view === 'CREATE' && (
        <AssessmentForm onSubmit={createAssessment} onCancel={() => setView('LIST')} />
      )}

      {view === 'RESOURCES' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
          <div className="max-w-2xl mx-auto space-y-8">
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900">Learning Materials</h3>
              <p className="text-slate-500">Upload documents, videos, and images.</p>
            </div>

            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center transition-all hover:border-indigo-300 hover:bg-indigo-50/30 group">
              <input
                type="file"
                multiple
                className="hidden"
                id="resource-upload"
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const newResources: CourseResource[] = Array.from(files).map((file: any) => {
                      let type: any = 'OTHER';
                      if (file.type.startsWith('video/')) type = 'VIDEO';
                      else if (file.type === 'application/pdf') type = 'PDF';
                      else if (file.type.startsWith('image/')) type = 'IMAGE';
                      else if (file.type.includes('word') || file.type.includes('document')) type = 'DOCUMENT';
                      else if (file.type.includes('sheet') || file.type.includes('excel') || file.type.includes('csv')) type = 'SPREADSHEET';

                      return {
                        id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        title: file.name,
                        url: URL.createObjectURL(file),
                        type,
                        mimeType: file.type,
                        instructorId: user.id,
                        createdAt: new Date().toISOString()
                      };
                    });

                    setResources(prev => [...prev, ...newResources]);
                    alert(`Successfully added ${newResources.length} file(s)!`);
                  }
                }}
              />
              <label htmlFor="resource-upload" className="cursor-pointer flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-indigo-600 shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                </div>
                <div>
                  <span className="font-bold text-indigo-600 text-lg">Click to Upload Materials</span>
                  <p className="text-xs text-slate-400 font-medium mt-1">PDF, Video, Images, Docs • Multiple Supported</p>
                </div>
              </label>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Library</h4>
              {resources.length === 0 ? (
                <p className="text-slate-400 italic text-center text-sm">No videos uploaded yet.</p>
              ) : (
                resources.map(r => (
                  <div key={r.id} className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-xl hover:border-indigo-100 transition-colors">
                    <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0 font-bold text-xs uppercase">
                      {r.type === 'VIDEO' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      ) : (
                        <span>{r.type.substr(0, 3)}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-bold text-slate-800 line-clamp-1">{r.title}</h5>
                      <p className="text-xs text-slate-500 uppercase tracking-wider">{r.type} • {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm('Delete this resource?')) {
                          setResources(prev => prev.filter(res => res.id !== r.id));
                        }
                      }}
                      className="text-red-400 hover:text-red-600 p-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div>
              <button onClick={() => setView('LIST')} className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors">
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'ANALYTICS' && (
        <AnalyticsView
          feedbacks={feedbacks}
          submissions={submissions}
          tags={tags}
          onBack={() => setView('LIST')}
        />
      )}

      {view === 'TAGS' && (
        <TagManager
          tags={tags}
          onUpdate={onUpdateTags}
          onBack={() => setView('LIST')}
        />
      )}

      {view === 'REVIEW' && activeSubmission && activeAssessment && (
        <SubmissionReview
          assessment={activeAssessment}
          submission={activeSubmission}
          tags={tags}
          onSubmit={submitFeedback}
          onCancel={() => setView('LIST')}
        />
      )}

      {view === 'LIST' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
              Assessments
            </h3>
            {assessments.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-white">
                <p className="text-slate-400">No assessments created.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assessments.map(a => (
                  <div key={a.id} className="p-5 bg-white border border-slate-200 rounded-2xl hover:shadow-md transition-shadow">
                    <h4 className="font-bold text-slate-900">{a.title}</h4>
                    <p className="text-xs text-slate-500 mt-1">Created on {new Date(a.createdAt).toLocaleDateString()}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded font-bold">
                        {submissions.filter(s => s.assessmentId === a.id).length} Submissions
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
              Submission Review Inbox
            </h3>
            {submissions.filter(s => s.status === SubmissionStatus.PENDING).length === 0 ? (
              <div className="p-12 border-2 border-dashed border-slate-200 rounded-2xl text-center bg-white">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h4 className="font-bold text-slate-800">No Pending Tasks</h4>
                <p className="text-slate-500 mt-1">Students will see your feedback immediately upon review.</p>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Assessment</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Submitted</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {submissions.filter(s => s.status === SubmissionStatus.PENDING).map(s => {
                      const assessment = assessments.find(a => a.id === s.assessmentId);
                      return (
                        <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-slate-900">{s.studentName}</p>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {assessment?.title || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(s.submittedAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleReview(s)}
                              className="px-3 py-1 bg-indigo-600 text-white rounded text-xs font-bold hover:bg-indigo-700 transition-colors"
                            >
                              Grade & Feedback
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
