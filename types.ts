
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

export interface ImageState {
  original: string | null;
  edited: string | null;
  analysis: AnalysisResult | null;
  chatHistory: ChatMessage[];
}
