
import React, { useState, useEffect } from 'react';
import { User, UserRole, Assessment, Submission, Feedback, FeedbackTag, SubmissionStatus, CourseResource, ChatMessage } from './types';
import InstructorDashboard from './pages/InstructorDashboard';
import StudentDashboard from './pages/StudentDashboard';
import HistoryView from './pages/HistoryView';
import FeedbackDetails from './pages/FeedbackDetails';
import AuthSelector from './pages/AuthSelector';
import BottomNav from './components/BottomNav';
import ChatOverlay from './components/ChatOverlay';

const INITIAL_TAGS: FeedbackTag[] = [
  { id: 't1', name: 'Logical Flow', category: 'STRUCTURE' },
  { id: 't2', name: 'Historical Context', category: 'CONTENT' },
  { id: 't3', name: 'Needs Evidence', category: 'CRITICAL_THINKING' },
  { id: 't4', name: 'Accurate', category: 'CONTENT' },
  { id: 't5', name: 'High Effort', category: 'REASONING' },
  { id: 't6', name: 'Needs Depth', category: 'CRITICAL_THINKING' },
];

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [resources, setResources] = useState<CourseResource[]>([]);
  const [tags, setTags] = useState<FeedbackTag[]>(INITIAL_TAGS);
  const [viewedFeedbackId, setViewedFeedbackId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'HOME' | 'HISTORY'>('HOME');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const savedAssessments = localStorage.getItem('assessments');
    const savedSubmissions = localStorage.getItem('submissions');
    const savedFeedbacks = localStorage.getItem('feedbacks');
    const savedResources = localStorage.getItem('resources');
    const savedTags = localStorage.getItem('feedback_tags');

    if (savedAssessments) setAssessments(JSON.parse(savedAssessments));
    if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));
    if (savedFeedbacks) setFeedbacks(JSON.parse(savedFeedbacks));
    if (savedResources) setResources(JSON.parse(savedResources));
    if (savedTags) setTags(JSON.parse(savedTags));

    // Initial load generic data done.
    // Chat history is now user-specific, loaded in separate effect below.

    if (!savedAssessments || JSON.parse(savedAssessments).length === 0) {
      const initialAssessment: Assessment = {
        id: 'a1',
        instructorId: 'i1',
        title: 'Industrial Revolution Impact',
        questions: [{
          id: 'q1',
          type: 'TEXT',
          text: 'Analyze the impact of the Industrial Revolution on urban migration patterns in 19th-century Europe. Focus on social shifts.'
        }],
        rubric: 'Focus on social dynamics, specific historical examples, and urbanization trends.',
        createdAt: new Date().toISOString()
      };
      setAssessments([initialAssessment]);
    }
  }, []);

  // Isolate Chat History per User
  useEffect(() => {
    if (currentUser) {
      const userHistoryKey = `chat_history_${currentUser.id}`;
      const savedUserChat = localStorage.getItem(userHistoryKey);
      if (savedUserChat) {
        setChatHistory(JSON.parse(savedUserChat));
      } else {
        setChatHistory([]); // Reset to empty if no history for this specific user
      }
    } else {
      setChatHistory([]);
    }
  }, [currentUser?.id]); // Re-run when user changes

  useEffect(() => {
    localStorage.setItem('assessments', JSON.stringify(assessments));
    localStorage.setItem('submissions', JSON.stringify(submissions));
    localStorage.setItem('feedbacks', JSON.stringify(feedbacks));
    localStorage.setItem('resources', JSON.stringify(resources));
    localStorage.setItem('feedback_tags', JSON.stringify(tags));

    // Save to user-specific key
    if (currentUser) {
      localStorage.setItem(`chat_history_${currentUser.id}`, JSON.stringify(chatHistory));
    }
  }, [assessments, submissions, feedbacks, resources, tags, chatHistory, currentUser]);

  if (!currentUser) {
    return <AuthSelector onSelect={setCurrentUser} />;
  }

  const markSubmissionAsViewed = (submissionId: string) => {
    setSubmissions(prev => prev.map(s =>
      s.id === submissionId && !s.viewedAt ? { ...s, viewedAt: new Date().toISOString() } : s
    ));
  };

  const handleUpdateTags = (newTags: FeedbackTag[]) => {
    setTags(newTags);
  };

  const renderContent = () => {
    if (viewedFeedbackId) {
      const feedback = feedbacks.find(f => f.id === viewedFeedbackId);
      const submission = submissions.find(s => s.id === feedback?.submissionId);
      const assessment = assessments.find(a => a.id === submission?.assessmentId);

      if (feedback && submission && assessment) {
        return (
          <FeedbackDetails
            feedback={feedback}
            submission={submission}
            assessment={assessment}
            tags={tags}
            onBack={() => setViewedFeedbackId(null)}
          />
        );
      }
    }

    if (currentView === 'HISTORY') {
      return <HistoryView chatHistory={chatHistory} />;
    }

    if (currentUser.role === UserRole.INSTRUCTOR) {
      return (
        <InstructorDashboard
          user={currentUser}
          assessments={assessments}
          setAssessments={setAssessments}
          submissions={submissions}
          setSubmissions={setSubmissions}
          feedbacks={feedbacks}
          setFeedbacks={setFeedbacks}
          resources={resources}
          setResources={setResources}
          tags={tags}
          onUpdateTags={handleUpdateTags}
        />
      );
    }

    return (
      <StudentDashboard
        user={currentUser}
        assessments={assessments}
        submissions={submissions}
        setSubmissions={setSubmissions}
        feedbacks={feedbacks}
        resources={resources}
        tags={tags}
        onViewFeedback={(id) => {
          markSubmissionAsViewed(id);
          const feedback = feedbacks.find(f => f.submissionId === id);
          if (feedback) setViewedFeedbackId(feedback.id);
        }}
      />
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F7F9FC]">
      <main className="flex-1 overflow-y-auto pb-24">
        {renderContent()}
      </main>
      <BottomNav
        user={currentUser}
        onLogout={() => setCurrentUser(null)}
        onOpenChat={() => setIsChatOpen(true)}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      <ChatOverlay
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userName={currentUser.name}
        messages={chatHistory}
        onSendMessage={(msg) => setChatHistory(prev => [...prev, msg])}
      />
    </div>
  );
};

export default App;
