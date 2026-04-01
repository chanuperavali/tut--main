# TutorIA - AI-Driven Learning Analytics PRD

## 1. Executive Summary
**TutorIA** is a next-generation feedback platform designed to empower instructors by bridging the gap between high-enrollment open-ended assessments and personalized student feedback. By leveraging Large Language Models (LLMs), the platform reduces instructor cognitive load while maintaining human-in-the-loop oversight.

## 2. User Personas & Workflows

### 2.1 Instructor
- **Goal:** Provide high-quality, actionable feedback to students on open-ended questions in record time.
- **Workflow:** 
  1. Define Assessment (Question + Rubric).
  2. Review Student Submissions via a dedicated inbox.
  3. Generate AI Feedback with customizable **Tone** and **Length**.
  4. Edit/Refine AI output and assign **Categorical Tags**.
  5. Monitor class-wide performance via **Analytics**.

### 2.2 Student
- **Goal:** Understand learning gaps and actionable steps for improvement.
- **Workflow:**
  1. View assigned assessments.
  2. Submit open-ended answers.
  3. Receive rich feedback notifications.
  4. Use **Fast AI Clarification** to resolve doubts about the received feedback.

## 3. Functional Requirements

### 3.1 AI Feedback Engine (Gemini 3 Flash)
- **Context-Aware:** Must incorporate original questions, student answers, and instructor rubrics.
- **Configurable:** Support for Tones (Encouraging, Academic, Socratic) and Lengths (Short, Medium, Long).
- **Structured Output:** Must provide a main feedback block, actionable improvement steps, and suggested tags.

### 3.2 Low-Latency Doubts Engine (Gemini Flash Lite)
- **Accessibility:** Available via a floating "Fast AI" chat overlay for both roles.
- **Speed:** Optimized for sub-second response times for simple clarifications.

### 3.3 Analytics & Tracking
- **Interaction Time:** Track seconds spent by instructors per feedback item.
- **AI Modification Rate:** Log whether instructors accept AI drafts "as-is" or modify them.
- **Student Engagement:** Track when and how often students view their feedback.

### 3.4 Tag Management System
- **Categorization:** Tags must be categorized into Content, Structure, Critical Thinking, and Reasoning.
- **Library:** A global tag library for consistent across-assessment reporting.

## 4. Technical Architecture

- **Frontend:** React with Tailwind CSS (Custom palette: #62676B, #A5A5A5, #DBC9BB, #D9CDBD, #E5E3D6).
- **API Strategy:**
  - `generateAiFeedback`: High-reasoning generation (Gemini 3 Flash).
  - `getClarification`: High-speed chat (Gemini Flash Lite).
- **State Management:** LocalStorage-based persistence for prototype/production-ready demonstrations without complex backend dependencies.

## 5. Success Metrics
1. **Instructional Efficiency:** 50%+ reduction in time spent per feedback message vs. manual entry.
2. **AI Utility:** >80% acceptance rate of AI-suggested tags.
3. **Student Satisfaction:** Measured via clarification chat volume (fewer chats indicate clearer initial feedback).
