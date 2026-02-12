export type OutputFormat = "conversation" | "bionic" | "rsvp" | "quiz";

export type ConversationStyle = "tutor" | "study-group";

export interface Speaker {
  name: string;
  role: "tutor" | "student" | "peer";
  color: string;
}

export interface DialogueLine {
  speaker: string;
  text: string;
}

export interface ConversationResult {
  format: "conversation";
  style: ConversationStyle;
  speakers: Speaker[];
  dialogue: DialogueLine[];
}

export interface BionicWord {
  bold: string;
  regular: string;
}

export interface BionicResult {
  format: "bionic";
  paragraphs: BionicWord[][];
}

export interface RSVPResult {
  format: "rsvp";
  words: string[];
}

export interface QuizQuestion {
  type: "multiple-choice" | "short-answer";
  question: string;
  options?: string[];
  correctIndex?: number;
  sampleAnswer?: string;
  explanation: string;
}

export interface QuizResult {
  format: "quiz";
  questions: QuizQuestion[];
}

export type ReformatResult = ConversationResult | BionicResult | RSVPResult | QuizResult;

export interface ReformatRequest {
  text: string;
  format: OutputFormat;
  conversationStyle?: ConversationStyle;
}
