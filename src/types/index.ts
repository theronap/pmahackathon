export type OutputFormat = "conversation" | "bionic" | "rsvp";

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

export type ReformatResult = ConversationResult | BionicResult | RSVPResult;

export interface ReformatRequest {
  text: string;
  format: OutputFormat;
  conversationStyle?: ConversationStyle;
}
