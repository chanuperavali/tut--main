
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

    const gateAssessment: Assessment = {
      id: 'a_gate_1',
      instructorId: 'i1',
      title: 'GATE CSE Previous Year Questions',
      questions: [
        { id: 'gq1', type: 'MCQ', text: 'In a compiler, keywords of a language are recognized during:', options: ['parsing of the program', 'the code generation', 'the lexical analysis of the program', 'dataflow analysis'], correctAnswer: 'the lexical analysis of the program' },
        { id: 'gq2', type: 'MCQ', text: 'Which one of the following is not a client-server application?', options: ['Internet chat', 'Web browsing', 'E-mail', 'Ping'], correctAnswer: 'Ping' },
        { id: 'gq3', type: 'MCQ', text: 'The protocol data unit (PDU) for the application layer in the Internet stack is:', options: ['Segment', 'Datagram', 'Message', 'Frame'], correctAnswer: 'Message' },
        { id: 'gq4', type: 'MCQ', text: 'The maximum number of superkeys for the relation schema R(E,F,G,H) with E as the key is:', options: ['5', '6', '7', '8'], correctAnswer: '8' },
        { id: 'gq5', type: 'MCQ', text: 'The number of tokens in the following C statement is: printf("i = %d, &i = %x", i, &i);', options: ['3', '26', '10', '21'], correctAnswer: '10' },
        { id: 'gq6', type: 'MCQ', text: 'The time complexity of computing the transitive closure of a boolean matrix of size n x n is:', options: ['O(n)', 'O(n^2)', 'O(n^3)', 'O(n^4)'], correctAnswer: 'O(n^3)' },
        { id: 'gq7', type: 'MCQ', text: 'Which of the following is true about a bipartite graph?', options: ['It has odd cycles', 'It has no odd cycles', 'Every bipartite graph is a tree', 'None of the above'], correctAnswer: 'It has no odd cycles' },
        { id: 'gq8', type: 'MCQ', text: 'What is the postfix equivalent of the prefix expression * + a b - c d', options: ['a b + c d - *', 'a b c d + - *', 'a b + c d * -', 'a b + - c d *'], correctAnswer: 'a b + c d - *' },
        { id: 'gq9', type: 'MCQ', text: 'The minimum number of page frames that must be allocated to a running process in a virtual memory environment is determined by:', options: ['the instruction set architecture', 'page size', 'physical memory size', 'number of processes in memory'], correctAnswer: 'the instruction set architecture' },
        { id: 'gq10', type: 'MCQ', text: 'In a relational database model, which of the following is a fundamental operation?', options: ['Natural Join', 'Assignment', 'Set Intersection', 'Union'], correctAnswer: 'Union' },
        { id: 'gq11', type: 'MCQ', text: 'Which of the following regular expressions denotes a language comprising all possible strings over the alphabet {a,b} of length n?', options: ['(a|b)^n', 'a^n b^n', '(a+b)*', 'a*b*'], correctAnswer: '(a|b)^n' },
        { id: 'gq12', type: 'MCQ', text: 'The number of flip-flops required to build a modulo-10 counter is:', options: ['3', '4', '5', '10'], correctAnswer: '4' },
        { id: 'gq13', type: 'MCQ', text: 'Which of the following sorting algorithms has the lowest worst-case time complexity?', options: ['Quick Sort', 'Bubble Sort', 'Merge Sort', 'Selection Sort'], correctAnswer: 'Merge Sort' },
        { id: 'gq14', type: 'MCQ', text: 'An operating system uses Shortest Remaining Time First (SRTF) scheduling algorithm. Which of the following might occur?', options: ['Deadlock', 'Starvation', 'Both Deadlock and Starvation', 'Neither'], correctAnswer: 'Starvation' },
        { id: 'gq15', type: 'MCQ', text: 'Which of the following problems is undecidable?', options: ['Equivalence of two DFAs', 'Finiteness of a context-free language', 'Membership problem for CFGs', 'Equivalence of two Turing machines'], correctAnswer: 'Equivalence of two Turing machines' },
        { id: 'gq16', type: 'MCQ', text: 'The concept of pipelining is most effective in improving the:', options: ['Throughput', 'Latency', 'Both throughput and latency', 'Neither'], correctAnswer: 'Throughput' },
        { id: 'gq17', type: 'MCQ', text: 'The default subnet mask for a class B network is:', options: ['255.0.0.0', '255.255.0.0', '255.255.255.0', '255.255.255.255'], correctAnswer: '255.255.0.0' },
        { id: 'gq18', type: 'MCQ', text: 'A relation R is in 3NF if every non-prime attribute of R is:', options: ['fully functionally dependent on the primary key', 'transitively dependent on the primary key', 'non-transitively dependent on every candidate key', 'partially dependent on the primary key'], correctAnswer: 'non-transitively dependent on every candidate key' },
        { id: 'gq19', type: 'MCQ', text: 'Which of the following traversals of a BST will output the keys in ascending order?', options: ['Preorder', 'Postorder', 'Inorder', 'Level-order'], correctAnswer: 'Inorder' },
        { id: 'gq20', type: 'MCQ', text: 'In software engineering, coupling refers to:', options: ['The degree of interdependence between software modules', 'The internal complexity of a module', 'The speed of a module', 'The memory footprint of a module'], correctAnswer: 'The degree of interdependence between software modules' }
      ],
      rubric: 'Multiple choice questions assessing fundamental computer science concepts based on previous GATE exams. Selecting the correct option earns full points.',
      createdAt: new Date().toISOString()
    };

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
      setAssessments([initialAssessment, gateAssessment]);
    } else {
      const parsedAssessments = JSON.parse(savedAssessments);
      if (!parsedAssessments.some((a: Assessment) => a.id === 'a_gate_1')) {
        setAssessments([...parsedAssessments, gateAssessment]);
      }
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
