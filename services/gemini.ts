
import { GoogleGenAI, Chat } from "@google/genai";
import { AnalysisResult } from "../types";

// The system instruction for the geo-analysis expert
const getSystemInstruction = (lang: string) => {
  const langMap: Record<string, string> = {
    'zh-CN': 'Simplified Chinese', 'zh-TW': 'Traditional Chinese', 'en': 'English',
    'ko': 'Korean', 'ja': 'Japanese', 'hi': 'Hindi', 'es': 'Spanish', 'ar': 'Arabic',
    'fr': 'French', 'bn': 'Bengali', 'pt': 'Portuguese', 'ru': 'Russian', 'id': 'Indonesian',
    'ur': 'Urdu', 'de': 'German', 'pcm': 'Nigerian Pidgin', 'arz': 'Egyptian Arabic',
    'mr': 'Marathi', 'vi': 'Vietnamese', 'te': 'Telugu', 'tr': 'Turkish',
    'pnb': 'Western Punjabi', 'sw': 'Swahili', 'tl': 'Tagalog', 'ta': 'Tamil',
    'fa': 'Persian', 'th': 'Thai', 'jv': 'Javanese'
  };
  const targetLang = langMap[lang] || 'Simplified Chinese';

  return `你是一位顶尖的地理情报分析专家。
你的核心能力是通过图片中的视觉线索锁定地理位置，并能根据用户后续的补充描述进行“动态校准”。

工作流程：
1. 初始分析：用户上传图片后，你必须提供 1 个主推地点（primaryLocation）和 30 个备选地点（topGuesses）。
2. 动态校准：在对话中，用户会提供更多细节（如：路牌语言、植物种类、天气特征、特定建筑颜色等）。你必须基于这些新情报，实时重新排序并精炼你的 30 个地点列表。

输出规范：
你必须【仅】返回一个合法的 JSON 对象，不要有任何开场白或解释文字。
JSON 结构如下：
{
  "identified": boolean, // 是否已完全锁定唯一目标
  "primaryLocation": { "name": "地名", "confidence": 0.0-1.0, "description": "精准描述" },
  "topGuesses": [
    { "name": "地名1", "confidence": 0.9, "description": "分析依据" },
    ... // 必须返回 30 个，按置信度排序
  ],
  "explanation": "简明扼要的推理总结"
}
注意：所有文本内容必须使用${targetLang}。`;
};

// Start a location identification session
export const startLocationSession = (base64Image: string, apiKey: string, model: string = 'gemini-3-flash-preview', language: string = 'zh-CN') => {
  // Use provided apiKey
  // @ts-ignore - configured for v1alpha if supported by SDK, otherwise relying on model routing
  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });
  const chat = ai.chats.create({
    model: model,
    config: {
      systemInstruction: getSystemInstruction(language),
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  });

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1],
    },
  };

  return { chat, imagePart };
};

// Send a calibration message to update the analysis
export const sendCalibrationMessage = async (chat: Chat, message: any): Promise<AnalysisResult> => {
  try {
    const response = await chat.sendMessage({ message });
    // Use the .text property to get the generated text
    const text = response.text || '{}';
    // 清洗可能存在的 markdown 标记
    const cleanedJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const result = JSON.parse(cleanedJson) as AnalysisResult;

    // 确保 topGuesses 始终是数组，防止前端渲染崩溃
    if (!Array.isArray(result.topGuesses)) {
      result.topGuesses = [];
    }
    return result;
  } catch (error) {
    console.error("Gemini 响应解析失败:", error);
    throw new Error("AI 响应异常，请尝试精简描述或重新发送。");
  }
};

// Edit the uploaded image using AI
export const editImageWithAI = async (base64Image: string, editPrompt: string, apiKey: string, model: string = 'gemini-3-flash-preview'): Promise<string> => {
  // Use provided apiKey
  const ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1],
    },
  };

  const response = await ai.models.generateContent({
    model: model,
    contents: {
      parts: [
        imagePart,
        { text: `请基于此图进行编辑：${editPrompt}。保持自然且高质。` }
      ]
    },
  });

  let editedBase64 = '';
  const candidate = response.candidates?.[0];
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      // Find the image part as it may not be the first part
      if (part.inlineData) {
        editedBase64 = `data:image/png;base64,${part.inlineData.data}`;
        break;
      }
    }
  }

  if (!editedBase64) throw new Error("编辑失败。");
  return editedBase64;
};
