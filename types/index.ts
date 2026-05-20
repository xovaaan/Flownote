export interface Meeting {
  id: string;
  userId: string;
  title: string;
  rawNotes: string;
  enhancedNotes: string | null;
  transcript: string;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
  folder: string | null;
  isEnhanced: boolean;
}

export interface MeetingInput {
  title: string;
  rawNotes?: string;
  transcript?: string;
  durationSeconds?: number;
  folder?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}
