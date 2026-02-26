import { GoogleGenAI } from '@google/genai';

// Lazy initialization of the AI client
let ai: GoogleGenAI | null = null;

function getAi() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('API key not configured. Please set the GEMINI_API_KEY environment variable.');
  }
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  return ai;
}

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64.split(',')[1],
      mimeType
    },
  };
}

export async function detectPlantDisease(imageBase64: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
    const imagePart = fileToGenerativePart(imageBase64, mimeType);

    const prompt = 'Analyze this image of a plant. Identify the plant species and check for any visible signs of disease or pests. Provide a detailed description of your findings, including potential issues and suggest remedies if any problems are detected. If the image is not a plant, say so.';

    const response = await aiClient.models.generateContent({ 
      model,
      contents: { parts: [imagePart, { text: prompt }] }
    });

    return response.text;
  } catch (error) {
    console.error('Error in detectPlantDisease:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while detecting plant disease.';
  }
}

export async function getCropTips(plantName: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const prompt = `Provide detailed crop cycle tips for ${plantName}. Include information on planting, watering, soil requirements, sunlight, pest control, and harvesting. Present the information in a clear, easy-to-read markdown format.`;

    const response = await aiClient.models.generateContent({ 
      model,
      contents: prompt 
    });

    return response.text;
  } catch (error) {
    console.error('Error in getCropTips:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while fetching crop tips.';
  }
}

export async function detectPest(imageBase64: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview';
    const mimeType = imageBase64.substring(imageBase64.indexOf(':') + 1, imageBase64.indexOf(';'));
    const imagePart = fileToGenerativePart(imageBase64, mimeType);

    const prompt = 'Analyze this image to identify any pests. Provide a detailed description of the findings, including the pest species, potential damage to crops, and suggested methods for control or eradication. If the image does not contain a recognizable pest, state that clearly.';

    const response = await aiClient.models.generateContent({ 
      model,
      contents: { parts: [imagePart, { text: prompt }] }
    });

    return response.text;
  } catch (error) {
    console.error('Error in detectPest:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while detecting pests.';
  }
}
export async function translateText(text: string, targetLanguageCode: string) {
  try {
    const aiClient = getAi();
    const model = 'gemini-3.1-pro-preview'; // Or a suitable text model
    const prompt = `Translate the following text into the language with BCP-47 code '${targetLanguageCode}':\n\n${text}`; 

    const response = await aiClient.models.generateContent({
      model,
      contents: { parts: [{ text: prompt }] },
    });

    return response.text;
  } catch (error) {
    console.error('Error in translateText:', error);
    if (error instanceof Error) {
      return error.message;
    }
    return 'An unknown error occurred while translating text.';
  }
}
