import { GoogleGenAI, Type } from "@google/genai";
import { SummaryLevel, Language, Flashcard, QuizQuestion, Slide, QuizDifficulty, QuizAnalysis, ResearchResult, PresentationDetailLevel } from "../types";

// Safely access process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' to avoid crashing if process is not defined in the browser environment
const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Helper to convert File to Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

export const generateSummary = async (
  fileBase64: string,
  mimeType: string,
  level: SummaryLevel,
  sourceLang: Language,
  targetLang: Language
): Promise<string> => {
  const modelId = 'gemini-2.5-flash';
  
  let langInstruction = `The output MUST be in ${targetLang}.`;
  
  if (targetLang === Language.ENGLISH_ARABIC) {
    langInstruction = `
      Provide a Bilingual Summary.
      Format: For every paragraph, bullet point, or key concept:
      1. Write the English text first.
      2. Immediately below it, write the Arabic translation on a new line.
      3. Use a clear separator or line break between items.
    `;
  }

  let prompt = `
    Summarize the attached document.
    Level of detail: ${level}.
    Source Language: ${sourceLang}.
    Target Language Instruction: ${langInstruction}
    
    IMPORTANT RULES:
    1. Format the output using clean, professional Markdown.
    2. Use standard Markdown headers (## for sections, ### for subsections).
    3. Use bullet points for lists.
    4. Ensure the structure flows logically like a study guide.
    
    CRITICAL - MATH & FORMATTING:
    - Do NOT use raw LaTeX code (no dollar signs $, no backslashes for commands like \frac).
    - Write mathematical equations in plain, readable text using standard Unicode symbols.
    - Examples: 
      - Instead of "$T_F = \frac{9}{5} T_C + 32$", write: "T_F = (9/5) * T_C + 32"
      - Instead of "^\circ C", write: "Â°C"
      - Instead of "\Delta", write: "Delta" or "Î"
    - Make sure units and numbers are clear and easy to read.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: prompt }
        ]
      }
    });

    return response.text || "Ø¹Ø°Ø±Ø§ÙØ ÙÙ Ø£ØªÙÙÙ ÙÙ Ø§Ø³ØªØ®Ø±Ø§Ø¬ Ø§ÙÙØµ.";
  } catch (error) {
    console.error("Summary error", error);
    throw new Error("ÙØ´ÙØª Ø¹ÙÙÙØ© Ø§ÙØªÙØ®ÙØµ. ØªØ£ÙØ¯ ÙÙ Ø£Ù Ø§ÙÙÙÙ ØµØ§ÙØ­ ÙØ­Ø§ÙÙ ÙØ±Ø© Ø£Ø®Ø±Ù.");
  }
};

export const generateFlashcards = async (
  fileBase64: string,
  mimeType: string
): Promise<Flashcard[]> => {
  const modelId = 'gemini-2.5-flash';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: "Generate 10-15 comprehensive flashcards from this document. Focus on key definitions, dates, and concepts. The 'front' should be a clear Question or Term. The 'back' should be the Answer or Definition. Return JSON." }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING, description: "The question or term (Arabic)" },
              back: { type: Type.STRING, description: "The answer or definition (Arabic)" }
            },
            required: ["front", "back"]
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text) as Flashcard[];
    }
    return [];
  } catch (error) {
    console.error("Flashcard error", error);
    throw new Error("ÙØ´Ù Ø¥ÙØ´Ø§Ø¡ Ø§ÙØ¨Ø·Ø§ÙØ§Øª Ø§ÙØªØ¹ÙÙÙÙØ©.");
  }
};

export const generateQuiz = async (
  fileBase64: string,
  mimeType: string,
  numQuestions: number,
  difficulty: QuizDifficulty
): Promise<QuizQuestion[]> => {
  const modelId = 'gemini-2.5-flash';

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          { inlineData: { mimeType, data: fileBase64 } },
          { text: `Generate a multiple choice quiz based on this document.
             Number of questions: ${numQuestions}.
             Difficulty Level: ${difficulty}.
             Language: Arabic.
             Return JSON.` 
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The question in Arabic" },
              options: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "4 possible answers in Arabic"
              },
              answer: { type: Type.STRING, description: "The correct answer (must match one of the options)" },
              explanation: { type: Type.STRING, description: "Brief explanation why this is correct in Arabic" }
            },
            required: ["question", "options", "answer", "explanation"]
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizQuestion[];
    }
    return [];
  } catch (error) {
    console.error("Quiz error", error);
    throw new Error("ÙØ´Ù Ø¥ÙØ´Ø§Ø¡ Ø§ÙØ§Ø®ØªØ¨Ø§Ø±.");
  }
};

export const analyzeQuizWeaknesses = async (
  questions: QuizQuestion[],
  wrongIndices: number[]
): Promise<QuizAnalysis> => {
  const modelId = 'gemini-2.5-flash';
  
  if (wrongIndices.length === 0) {
    return {
      weakPoints: [],
      recommendations: "Ø£Ø­Ø³ÙØª! Ø£Ø¯Ø§Ø¤Ù ÙÙØªØ§Ø² ÙÙØ§ ØªÙØ¬Ø¯ ÙÙØ§Ø· Ø¶Ø¹Ù ÙØ§Ø¶Ø­Ø©."
    };
  }

  const wrongQuestionsText = wrongIndices.map(i => 
    `Question: ${questions[i].question}\nCorrect Answer: ${questions[i].answer}`
  ).join("\n\n");

  const prompt = `
    Analyze the following list of questions a student answered incorrectly.
    Identify the underlying topics or concepts they are struggling with (Weak Points).
    Provide specific recommendations for what they should study.
    Language: Arabic.
    
    Wrong Questions:
    ${wrongQuestionsText}
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weakPoints: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of weak topics" },
            recommendations: { type: Type.STRING, description: "Study advice paragraph" }
          },
          required: ["weakPoints", "recommendations"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as QuizAnalysis;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Analysis error", error);
    return { weakPoints: ["ØªØ¹Ø°Ø± Ø§ÙØªØ­ÙÙÙ"], recommendations: "Ø±Ø§Ø¬Ø¹ Ø§ÙØ£Ø³Ø¦ÙØ© Ø§ÙØªÙ Ø£Ø®Ø·Ø£Øª ÙÙÙØ§." };
  }
};

export const conductResearch = async (topic: string, wordCount: number): Promise<ResearchResult> => {
  const modelId = 'gemini-2.5-flash'; 

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Write a comprehensive academic research summary about: "${topic}".
      
      Requirements:
      1. Length: Approximately ${wordCount} words.
      2. Language: Arabic.
      3. Academic Tone: Formal, objective, and structured.
      4. Structure: Do not include a Main Title (H1) as I will add it manually. Start with an Introduction (H2), then Key Points/Sections (H2), Analysis (H2), and Conclusion (H2).
      5. Citations: Use the provided Google Search tool to find real, relevant, and recent sources. Cite them in the text using [Source Name] format.
      6. Format: Clean Markdown. Use bullet points where appropriate.
      `,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const sources: { uri: string; title: string }[] = [];
    
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach(chunk => {
        if (chunk.web) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }

    return {
      content: response.text || "ØªØ¹Ø°Ø± Ø¥ÙØ´Ø§Ø¡ Ø§ÙØ¨Ø­Ø«.",
      sources
    };
  } catch (error) {
    console.error("Research error", error);
    throw new Error("Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«ÙØ§Ø¡ Ø§ÙØ¨Ø­Ø«. Ø­Ø§ÙÙ ÙÙØ¶ÙØ¹Ø§Ù Ø¢Ø®Ø±.");
  }
};

export const generateSlideImage = async (prompt: string): Promise<string | undefined> => {
  const modelId = 'gemini-2.5-flash-image';
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: `Create a professional, modern illustration for a presentation slide about: ${prompt}. 
        Style: Minimalist vector art, clean lines, academic aesthetic.
        IMPORTANT: Do NOT include any text, letters, or words inside the image. Just visual graphics.` }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return undefined;
  } catch (error) {
    console.warn("Image gen failed", error);
    return undefined;
  }
};

export const generatePresentation = async (
  topicOrFileBase64: string, 
  isFileType: boolean,
  withImages: boolean,
  slideCount: number,
  detailLevel: PresentationDetailLevel
): Promise<Slide[]> => {
  const textModelId = 'gemini-2.5-flash';
  
  const parts: any[] = [];
  
  let instructions = `
    Create a professional presentation.
    Slide Count: Approximately ${slideCount} slides.
    Language: Arabic.
    Detail Level: ${detailLevel}.
    
    IMPORTANT FORMATTING RULES:
    1. Keep bullet points concise relative to the requested detail level.
    2. Maximum 5 bullet points per slide.
    3. Do NOT use long paragraphs.
    4. Use professional and academic language.
    5. DATA VISUALIZATION: If the content contains statistical data, numerical comparisons, or percentage breakdowns, YOU MUST include a 'chart' object in the JSON for that slide.
       - Use 'bar' for comparisons.
       - Use 'pie' for parts of a whole (percentages).
       - Provide the data points clearly.
  `;

  if (isFileType) {
    parts.push({ inlineData: { mimeType: 'application/pdf', data: topicOrFileBase64 } });
    parts.push({ text: instructions });
  } else {
    parts.push({ text: `Topic: ${topicOrFileBase64}\n${instructions}` });
  }

  try {
    const response = await ai.models.generateContent({
      model: textModelId,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.ARRAY, items: { type: Type.STRING } },
              speakerNotes: { type: Type.STRING },
              chart: {
                type: Type.OBJECT,
                description: "Optional chart data if applicable",
                properties: {
                   type: { type: Type.STRING, enum: ['bar', 'pie'] },
                   title: { type: Type.STRING },
                   data: { 
                     type: Type.ARRAY, 
                     items: {
                       type: Type.OBJECT,
                       properties: {
                         name: { type: Type.STRING },
                         value: { type: Type.NUMBER }
                       }
                     }
                   }
                },
                nullable: true
              }
            },
            required: ["title", "content", "speakerNotes"]
          }
        }
      }
    });

    let slides: Slide[] = [];
    if (response.text) {
      slides = JSON.parse(response.text) as Slide[];
    }

    if (withImages && slides.length > 0) {
       const imagePromises = slides.map(async (slide) => {
         if (slide.chart) return slide;
         const img = await generateSlideImage(slide.title);
         return { ...slide, imageBase64: img };
       });
       
       slides = await Promise.all(imagePromises);
    }

    return slides;
  } catch (error) {
    console.error("Presentation error", error);
    throw new Error("ÙØ´Ù Ø¥ÙØ´Ø§Ø¡ Ø§ÙØ¹Ø±Ø¶ Ø§ÙØªÙØ¯ÙÙÙ.");
  }
};