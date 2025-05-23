
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CATEGORIES_DATA, GEMINI_MODEL_TEXT } from '../constants';
import { CategorizationResult } from '../types';

// Ensure API_KEY is available. In a real app, this would be handled by the build/environment.
// For this exercise, we rely on `process.env.API_KEY` being set.
const apiKey = process.env.API_KEY;
if (!apiKey) {
  console.error("API_KEY for Gemini is not set. AI features will be limited.");
  // alert("Gemini API Key is missing. AI categorization will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "MISSING_API_KEY" }); // Provide a fallback for initialization if key is missing

const generateCategorizationPrompt = (text: string): string => {
  const categoriesList = CATEGORIES_DATA.map(cat => 
    `"${cat.name}": [${cat.subcategories.map(sub => `"${sub}"`).join(", ")}]`
  ).join(",\n    ");

  return `
Analyze the following employee submission from a factory/machine shop environment.
Classify it into one of the predefined primary categories and one of its corresponding subcategories.

Employee Submission:
"${text}"

Predefined Categories and Subcategories (JSON format):
{
    ${categoriesList}
}

Respond ONLY with a JSON object in the format: {"category": "CATEGORY_NAME", "subcategory": "SUBCATEGORY_NAME"}.
If the submission doesn't clearly fit any specific subcategory but fits a category, choose the most general subcategory or the first one listed for that category.
If it doesn't fit any category, use "Uncategorized" for both.
Example response: {"category": "Safety (Machine Shop)", "subcategory": "Hazard Reporting"}
`;
};

export const categorizeSubmissionWithGemini = async (description: string): Promise<CategorizationResult> => {
  if (!apiKey) {
    // Fallback or error if API key is missing
    console.warn("Gemini API key not available. Falling back to default categorization.");
    return { category: "Uncategorized", subcategory: "Uncategorized" };
  }

  const prompt = generateCategorizationPrompt(description);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL_TEXT,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.2, // Lower temperature for more deterministic categorization
      },
    });

    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedResult = JSON.parse(jsonStr) as CategorizationResult;
    
    // Validate result against known categories
    const foundCategory = CATEGORIES_DATA.find(c => c.name === parsedResult.category);
    if (foundCategory) {
        if (foundCategory.subcategories.includes(parsedResult.subcategory)) {
            return parsedResult;
        } else {
            // If subcategory is invalid but category is valid, pick first subcategory or "Uncategorized"
            console.warn(`Gemini returned invalid subcategory '${parsedResult.subcategory}' for category '${parsedResult.category}'. Defaulting subcategory.`);
            return { category: parsedResult.category, subcategory: foundCategory.subcategories[0] || "Uncategorized" };
        }
    }
    
    console.warn(`Gemini returned an unknown category: ${parsedResult.category}. Defaulting.`);
    return { category: "Uncategorized", subcategory: "Uncategorized" };

  } catch (error) {
    console.error("Error calling Gemini API for categorization:", error);
    // Fallback to a default or error state
    return { category: "Uncategorized", subcategory: "Uncategorized" };
  }
};
