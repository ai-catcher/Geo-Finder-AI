
export interface LocationInfo {
  name: string;
  confidence: number;
  description: string;
}

export interface AnalysisResult {
  identified: boolean;
  primaryLocation?: LocationInfo;
  topGuesses: LocationInfo[];
  explanation: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  result?: AnalysisResult;
}

export enum AppMode {
  IDENTIFY = 'IDENTIFY',
  EDIT = 'EDIT'
}

export enum GeminiModel {
  GEMINI_2_0_FLASH_EXP = 'gemini-2.0-flash-exp'
}

export interface AppSettings {
  apiKey: string;
  model: GeminiModel;
}

export interface ImageState {
  original: string | null;
  edited: string | null;
  analysis: AnalysisResult | null;
  chatHistory: ChatMessage[];
}
