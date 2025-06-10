import { GoogleGenerativeAI } from "@google/generative-ai";

// Validate API key on initialization
if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY is not set. AI features will be disabled.");
}

// Initialize the Google Gemini API with the API key
const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// Access Gemini model (Gemini 1.0 Pro by default)
const model = genAI?.getGenerativeModel({ model: "gemini-1.0-pro" });

export interface GenerationOptions {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

export async function generateDocument(
  prompt: string,
  options: GenerationOptions = {}
): Promise<string> {
  if (!model) {
    throw new Error(
      "Gemini API is not configured. Please set GEMINI_API_KEY environment variable."
    );
  }

  if (!prompt || prompt.trim().length === 0) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    // Configure the generation parameters with safe defaults
    const generationConfig = {
      temperature: Math.max(0, Math.min(2, options.temperature || 0.7)),
      topK: Math.max(1, Math.min(100, options.topK || 40)),
      topP: Math.max(0, Math.min(1, options.topP || 0.95)),
      maxOutputTokens: Math.max(
        1,
        Math.min(32768, options.maxOutputTokens || 8192)
      ),
    };

    // Generate content using the Gemini API
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
    });

    // Check if response is valid
    const response = result.response;
    if (!response) {
      throw new Error("No response received from Gemini API");
    }

    const text = response.text();
    if (!text || text.trim().length === 0) {
      throw new Error("Empty response received from Gemini API");
    }

    return text;
  } catch (error: any) {
    console.error("Error generating document with Gemini:", error);

    // Provide more specific error messages
    if (error?.message?.includes("API_KEY_INVALID")) {
      throw new Error(
        "Invalid Gemini API key. Please check your configuration."
      );
    } else if (error?.message?.includes("QUOTA_EXCEEDED")) {
      throw new Error("Gemini API quota exceeded. Please try again later.");
    } else if (error?.message?.includes("SAFETY")) {
      throw new Error(
        "Content was blocked by safety filters. Please try a different prompt."
      );
    } else {
      throw new Error(
        `Failed to generate document: ${error?.message || "Unknown error"}`
      );
    }
  }
}

export async function generateTitle(content: string): Promise<string> {
  if (!model) {
    console.warn("Gemini API not configured, using default title");
    return "Generated Documentation";
  }

  if (!content || content.trim().length === 0) {
    return "Untitled Document";
  }

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

    const response = result.response;
    if (!response) {
      return "Generated Documentation";
    }

    const title = response.text().trim();
    // Remove any quotes or excess whitespace that might be in the generated title
    const cleanTitle = title.replace(/^["']|["']$/g, "");

    // Ensure title is not empty and has reasonable length
    if (cleanTitle.length === 0) {
      return "Generated Documentation";
    }

    // Truncate if too long
    return cleanTitle.length > 100
      ? cleanTitle.substring(0, 100) + "..."
      : cleanTitle;
  } catch (error: any) {
    console.error("Error generating title with Gemini:", error);
    return "Generated Documentation";
  }
}
