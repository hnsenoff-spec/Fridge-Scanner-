import { GoogleGenAI, Type } from "@google/genai";
import { SYSTEM_INSTRUCTION_INVENTORY, SYSTEM_INSTRUCTION_RECIPES } from "../constants";
import { Ingredient, Recipe, Store, GroundingChunk } from "../types";

// Helper to get fresh client
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// 1. Vision: Identify Ingredients
export const identifyIngredientsFromImage = async (base64Image: string): Promise<Ingredient[]> => {
  const ai = getAiClient();
  const model = "gemini-3-flash-preview"; 

  const today = new Date().toISOString().split('T')[0];
  const prompt = `Today is ${today}. Identify ingredients in this image. Return valid JSON only.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_INVENTORY,
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING },
                    quantity: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['produce', 'dairy', 'protein', 'pantry', 'other'] },
                    expiryDate: { type: Type.STRING, description: "YYYY-MM-DD" }
                }
            }
        }
      }
    });

    const text = response.text || "[]";
    const data = JSON.parse(text);
    return data.map((item: any, index: number) => ({ ...item, id: `ing-${Date.now()}-${index}` }));
  } catch (error) {
    console.error("Error identifying ingredients:", error);
    throw error;
  }
};

// 2. Search Grounding: Generate Recipes
export const generateRecipes = async (ingredients: Ingredient[], preferences: string): Promise<{ recipes: Recipe[], groundingChunks: GroundingChunk[] }> => {
  const ai = getAiClient();
  const model = "gemini-3-flash-preview";

  const ingredientList = ingredients.map(i => `${i.name} (expires: ${i.expiryDate || 'unknown'})`).join(", ");
  const prompt = `I have these ingredients: ${ingredientList}. 
  Preferences: ${preferences || "None"}.
  Suggest 3 creative recipes to use up the expiring items.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION_RECIPES,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.OBJECT,
            properties: {
                recipes: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            cookingTime: { type: Type.STRING },
                            difficulty: { type: Type.STRING, enum: ['Easy', 'Medium', 'Hard'] },
                            usedIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            missingIngredients: { type: Type.ARRAY, items: { type: Type.STRING } },
                            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
                            calories: { type: Type.NUMBER }
                        }
                    }
                }
            }
        }
      }
    });

    const text = response.text || "{\"recipes\": []}";
    const data = JSON.parse(text);
    
    // Extract grounding metadata
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { 
        recipes: data.recipes.map((r: any, i: number) => ({ ...r, id: `recipe-${i}` })),
        groundingChunks
    };
  } catch (error) {
    console.error("Error generating recipes:", error);
    throw error;
  }
};

// 3. Maps Grounding: Find Stores
export const findGroceryStores = async (lat: number, lng: number): Promise<{ text: string, stores: Store[], groundingChunks: GroundingChunk[] }> => {
  const ai = getAiClient();
  // MUST use gemini-2.5-flash for Maps
  const model = "gemini-2.5-flash"; 

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Find the best rated grocery stores near me that are open right now. Give a short summary of the top choice.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: { latitude: lat, longitude: lng }
          }
        }
      }
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    // Manually parse grounding chunks into a cleaner Store interface for UI if possible, 
    // but often Maps returns the data directly in the chunks.
    // We will return the raw text + chunks for the UI to render.
    
    return {
      text: response.text || "No stores found.",
      stores: [], // Maps grounding data is primarily in chunks or text
      groundingChunks
    };
  } catch (error) {
    console.error("Error finding stores:", error);
    throw error;
  }
};

// 4. Image Editing: Nano Banana / Food Stylist
export const editFoodImage = async (base64Image: string, prompt: string): Promise<string> => {
  const ai = getAiClient();
  // MUST use gemini-2.5-flash-image for Editing
  const model = "gemini-2.5-flash-image"; 

  try {
    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Image
                    }
                },
                { text: prompt }
            ]
        }
    });

    // Check for image in parts
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};
