
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
  GEMINI_2_0_FLASH_EXP = 'gemini-2.0-flash-exp',
  GEMINI_3_0_FLASH = 'gemini-3-flash-preview',
  GEMINI_3_1_PRO = 'gemini-3.1-pro-preview',
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
