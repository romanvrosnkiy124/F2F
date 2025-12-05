import { GoogleGenAI } from "@google/genai";
import { User } from '../types';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const generateIcebreaker = async (me: User, other: User): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Привет! Классные фото.";

  try {
    const prompt = `
      Ты помощник в приложении для знакомств "F2F".
      Пользователь А (Я): ${JSON.stringify(me.interests)}, Био: ${me.bio}.
      Пользователь Б (Собеседник): ${JSON.stringify(other.interests)}, Био: ${other.bio}.
      
      Напиши 1 короткое, дружелюбное сообщение (на русском языке) от лица Пользователя А для начала разговора.
      Опирайся на общие интересы. Не используй смайлики чрезмерно. Длина до 150 символов.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Привет! У нас похожие интересы!";
  }
};

export const analyzeCompatibility = async (me: User, other: User): Promise<string> => {
  const ai = getAiClient();
  if (!ai) return "Вы оба классные!";

  try {
    const prompt = `
      Сравни двух людей для дружбы.
      Я: ${JSON.stringify(me.interests)}, Возраст: ${me.age}.
      Друг: ${JSON.stringify(other.interests)}, Возраст: ${other.age}.
      
      Напиши 2-3 предложения на русском, почему нам стоит пообщаться. Будь краток и позитивен.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    return "У вас много общего!";
  }
};