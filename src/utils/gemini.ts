import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Google Gemini API with the API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Access Gemini model (Gemini 1.0 Pro by default)
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });

export interface GenerationOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export async function generateDocument(
  prompt: string,
  options: GenerationOptions = {}
) {
  try {
    // Configure the generation parameters
    const generationConfig = {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxOutputTokens || 8192,
    };

    // Generate content using the Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    // Extract the response text
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error("Error generating document with Gemini:", error);
    throw new Error("Failed to generate document");
  }
}

export async function generateTitle(content: string): Promise<string> {
  try {
    // Generate a title for the document based on content
    const prompt = `Generate a concise, descriptive title for the following document content:\n\n${content.substring(
      0,
      2000
    )}...\n\nTitle:`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 50,
      },
    });

    const title = result.response.text().trim();
    // Remove any quotes or excess whitespace that might be in the generated title
    return title.replace(/^["']|["']$/g, "");
  } catch (error) {
    console.error("Error generating title with Gemini:", error);
    return "Untitled Document";
  }
}
