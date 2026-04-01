
import { GoogleGenAI, Type } from "@google/genai";
import { AiFeedbackResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

/**
 * Standard feedback generation using Flash for balance of speed and reasoning
 * Incorporates instructor tone and length preferences.
 */
import { Question } from "../types"; // Ensure import

export const generateAiFeedback = async (
  questions: Question[],
  answers: Record<string, string>,
  rubric: string,
  tone: string = 'Encouraging, constructive, and academic',
  lengthPreference: 'Short' | 'Medium' | 'Long' = 'Medium'
): Promise<AiFeedbackResponse> => {
  const model = 'gemini-2.5-flash';

  // Mapping length preference to approximate word counts for the LLM
  const lengthGuideline = {
    'Short': 'be concise and direct, approximately 50-80 words.',
    'Medium': 'be well-balanced and detailed, approximately 100-200 words.',
    'Long': 'be very comprehensive and deeply analytical, approximately 250-400 words.'
  }[lengthPreference];

  // Construct Q&A Context
  const qaContext = questions.map((q, i) => `
    Q${i + 1}: ${q.text} (${q.type})
    Student Answer: ${answers[q.id] || "No Answer"}
  `).join('\n');

  const prompt = `
    As an expert academic instructor, evaluate the following student submission based on the questions and rubric provided.
    
    ---
    CONTEXT:
    ${qaContext}
    
    Rubric/Guidelines: ${rubric}
    ---
    
    INSTRUCTIONS:
    1. Feedback Tone: ${tone}. It is critical that you maintain this specific tone throughout the message.
    2. Feedback Length: The feedback should ${lengthGuideline} Reference specific parts of the student's answers.
    3. Tags: Suggest 3-5 short, professional tags.
    4. Improvements: Provide exactly 3 highly actionable and specific improvement steps.
    5. Model Answer: Provide a concise summary or key points for each question to show what a 10/10 response looks like.
    
    Ensure the feedback is professional yet adheres to the chosen tone.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: {
              type: Type.STRING,
              description: "The main feedback message for the student, adhering to the requested tone and length guidelines."
            },
            suggestedTags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Short categorical tags for this feedback."
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Exactly 3 actionable improvement steps."
            },
            modelAnswer: {
              type: Type.STRING,
              description: "An ideal 10/10 answer or key points outline based on the rubric."
            }
          },
          required: ["feedback", "suggestedTags", "improvements", "modelAnswer"]
        }
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text) as AiFeedbackResponse;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate AI feedback. Please check your connectivity or API key.");
  }
};

/**
 * Low-latency clarification service using Flash Lite for instant responses
 */
/**
 * General-purpose chat service using Flash Lite.
 * Includes strict safety guardrails against toxic content.
 */
export const getChatResponse = async (query: string, context: string = ""): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const prompt = `
    You are TutorIA, a helpful, harmless, and honest AI learning assistant.
    
    User Query: ${query}
    ${context ? `Relevant Context: ${context}` : ""}
    
    INSTRUCTIONS:
    1. Answer ANY general question the user asks (like ChatGPT). You are not limited to tutoring.
    2. SAFETY IS PARAMOUNT. Do not generate hate speech, toxic content, dangerous instructions, or sexually explicit material.
    3. If the user asks for a joke, code, or general advice, provide it helpfuly.
    4. Keep answers concise and easy to read. Use Markdown.
    5. If a topic is controversial, provide a neutral, factual overview.
    
    Response:
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error: any) {
    console.error("Fast AI Error:", error);

    // Debugging: Check if API key is present
    if (!import.meta.env.VITE_GEMINI_API_KEY) {
      return "System Error: VITE_GEMINI_API_KEY is missing. Please check your .env file.";
    }

    return `The Fast AI service is currently unavailable. Error: ${error.message || error}`;
  }
};

/**
 * Summarizes the educational content of a video based on its title and URL/context.
 */
/**
 * Summarizes an educational resource (Video, PDF, Image, etc.).
 * - Videos/PPTs/Docs: Summarized by Title/Context (Inference).
 * - Images/PDFs: Summarized by visual/content analysis if accessible.
 */
export const summarizeResource = async (title: string, resourceUrl: string, type: 'VIDEO' | 'PDF' | 'IMAGE' | 'DOCUMENT' | 'SPREADSHEET' | 'OTHER'): Promise<string> => {
  const model = 'gemini-2.5-flash';

  // 1. Inferred Text Summary (Fallback or Primary for non-visuals like Video/PPT)
  const inferencePrompt = `
    You are an expert academic tutor.
    Task: Summarize the likely educational content of the following resource for a student.
    
    Resource Title: ${title}
    Type: ${type}
    Context URL: ${resourceUrl}
    
    Since you cannot directly access external files in this demo environment, infer the DETAILED core idea and key takeaways based on the title and type.
    
    Structure:
    1. **Core Concept**: One sentence summarizing the main topic.
    2. **Key Takeaways**: 3-5 bullet points of the most important concepts likely covered.
    3. **Study Tip**: A brief tip on how to best study this material.
    
    Keep the tone educational and helpful. Dive straight into the facts.
  `;

  // 2. Attempt Multimodal Analysis for Images/PDFs (if blob is accessible)
  if (type === 'IMAGE' || type === 'PDF') {
    try {
      const resp = await fetch(resourceUrl);
      if (resp.ok) {
        const blob = await resp.blob();
        if (blob) {
          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const base64 = (reader.result as string).split(',')[1];
              resolve(base64);
            };
            reader.onerror = reject;
          });
          reader.readAsDataURL(blob);
          const base64Data = await base64Promise;

          // Send to Gemini with inline data
          const result = await ai.models.generateContent({
            model: model,
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `Summarize this educational ${type} for a student. Focus on key concepts and takeaways.` },
                  { inlineData: { mimeType: blob.type, data: base64Data } }
                ]
              }
            ]
          });
          return result.text || "Analysis complete but no text generated.";
        }
      }
    } catch (e) {
      console.warn("Could not fetch resource for multimodal analysis, falling back to inference.", e);
    }
  }

  // Fallback / standard path
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: inferencePrompt,
    });
    return response.text || "Summary unavailable.";
  } catch (error) {
    console.error("Resource Summary Error:", error);
    return "Unable to generate summary at this time.";
  }
};
