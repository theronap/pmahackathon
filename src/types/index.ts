export type OutputFormat = "conversation" | "bionic" | "rsvp" | "quiz" | "groupchat";

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

// Supabase table types

export interface Profile {
  id: string;
  email: string;
  display_name: string | null;
  preferred_format: OutputFormat;
  preferred_style: ConversationStyle;
  show_typing_indicator: boolean;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  input_text: string;
  input_source: "paste" | "file_upload";
  file_name: string | null;
  file_storage_path: string | null;
  format: OutputFormat;
  conversation_style: ConversationStyle | null;
  result: ReformatResult;
  created_at: string;
}

// Learning flow types

export type LearningMode = "focus" | "story" | "quiz" | "groupchat" | "rsvp" | "plain";

export type TimePreference = "10min" | "15min" | "30min" | "nolimit";

export interface SetupConfig {
  mode: LearningMode;
  time: TimePreference | null;
}

export interface GroupChatMessage {
  id: string;
  sender: string;
  text: string;
  isUser: boolean;
  color: string;
}

export interface GroupChatResult {
  format: "groupchat";
  messages: GroupChatMessage[];
}
