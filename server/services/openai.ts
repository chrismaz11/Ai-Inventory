import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

export interface AnalyzedItem {
  name: string;
  description: string;
  category: string;
  quantity: number;
  confidence: number; // 0-100
}

export async function analyzeStoragePhoto(base64Image: string): Promise<AnalyzedItem[]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert inventory assistant. Analyze the image and identify all items that could be stored in this container/storage space. For each item you can identify, provide:
          - name: A clear, concise name for the item
          - description: A brief description of the item
          - category: A general category (Electronics, Clothing, Books, Tools, Kitchen, Toys, Sports, Office, etc.)
          - quantity: Estimated quantity if multiple of the same item are visible
          - confidence: Your confidence in the identification (0-100)

          Only include items you can clearly identify. If items are partially obscured or unclear, use lower confidence scores. Return the response as a JSON object with an "items" array.`
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please analyze this storage photo and identify all the items you can see. Return the results in JSON format."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    if (!result.items || !Array.isArray(result.items)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return result.items.map((item: any) => ({
      name: item.name || "Unknown Item",
      description: item.description || "",
      category: item.category || "Miscellaneous",
      quantity: Math.max(1, parseInt(item.quantity) || 1),
      confidence: Math.max(0, Math.min(100, parseInt(item.confidence) || 50)),
    }));

  } catch (error) {
    console.error("Error analyzing image with OpenAI:", error);
    throw new Error(`Failed to analyze image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateItemSummary(items: AnalyzedItem[]): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an inventory assistant. Create a brief, natural summary of the items that were identified in a storage unit."
        },
        {
          role: "user",
          content: `Create a brief summary for these identified items: ${JSON.stringify(items)}. Keep it concise and natural.`
        },
      ],
      max_tokens: 100,
    });

    return response.choices[0].message.content || "Items analyzed and cataloged";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Items analyzed and cataloged";
  }
}
