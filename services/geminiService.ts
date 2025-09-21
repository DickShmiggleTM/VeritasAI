import { GoogleGenAI, GenerateContentResponse, GroundingChunk } from "@google/genai";
// FIX: Added .ts extension to fix module resolution error.
import type { ResearchResult, ResearchDepth, Source } from '../types.ts';

const getSystemInstruction = (depth: ResearchDepth) => {
  let depthInstruction = '';
  switch (depth) {
    case 'surface':
      depthInstruction = 'Provide a concise, high-level overview. Focus on the main points and key definitions. The knowledge graph should be simple with only major entities.';
      break;
    case 'moderate':
      depthInstruction = 'Provide a detailed exploration of the topic. Cover the main aspects, including historical context, key figures, and major theories or components. The knowledge graph should be moderately detailed.';
      break;
    case 'deep':
      depthInstruction = 'Provide a comprehensive, in-depth analysis. Explore nuances, controversies, related concepts, and future implications. The knowledge graph should be extensive, showing complex relationships.';
      break;
  }

  return `You are a research assistant called Codex Veritas. Your purpose is to analyze a topic and provide a structured, verifiable response grounded in Google Search results.

Your response MUST be a single JSON object. Do not add any text before or after the JSON object. Do not use markdown formatting (e.g., \`\`\`json).

The JSON object must have the following structure:
{
  "summary": "A detailed summary of the topic, based on the specified research depth.",
  "graphData": {
    "nodes": [
      { "id": "entity_id", "name": "Entity Name", "type": "category", "description": "A brief description of the entity." }
    ],
    "links": [
      { "source": "entity_id_1", "target": "entity_id_2", "label": "Relationship" }
    ]
  }
}

${depthInstruction}

Analyze the provided search results to synthesize the summary and construct the knowledge graph. Ensure all information is attributable to the provided sources.`;
};

const getDocumentSystemInstruction = () => {
  return `You are a research assistant called Codex Veritas. Your task is to analyze the provided text content from a document and answer a user's question based ONLY on that content.

Your response MUST be a single JSON object. Do not add any text before or after the JSON object. Do not use markdown formatting (e.g., \`\`\`json).

The JSON object must have the following structure:
{
  "summary": "A detailed summary of the answer to the user's question, derived exclusively from the provided document text.",
  "graphData": {
    "nodes": [
      { "id": "entity_id", "name": "Entity Name", "type": "category", "description": "A brief description of the entity based on the document." }
    ],
    "links": [
      { "source": "entity_id_1", "target": "entity_id_2", "label": "Relationship" }
    ]
  }
}

Strictly base your entire response on the document text provided by the user. Do not use any external knowledge. If the answer cannot be found in the text, state that clearly in the summary. The knowledge graph should represent the key entities and their relationships relevant to the question, as described in the document.`;
};

const parseGroundedSources = (response: GenerateContentResponse): Source[] => {
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (!groundingMetadata?.groundingChunks) {
        return [];
    }

    const uniqueSources: Map<string, Source> = new Map();

    groundingMetadata.groundingChunks.forEach((chunk: GroundingChunk) => {
        if (chunk.web) {
            const { uri, title } = chunk.web;
            if (uri && !uniqueSources.has(uri)) {
                uniqueSources.set(uri, {
                    url: uri,
                    title: title || 'Untitled Source',
                    // These fields are not directly provided by grounding, so we create placeholders.
                    // A more advanced implementation might involve another AI call to evaluate sources.
                    confidenceScore: 85, // Placeholder score
                    justification: "This source was used by the model to generate the response."
                });
            }
        }
    });

    return Array.from(uniqueSources.values());
};


export const conductGoogleResearch = async (topic: string, depth: ResearchDepth): Promise<ResearchResult> => {
  try {
    // FIX: Initialize GoogleGenAI with a named apiKey parameter as per guidelines.
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
    
    // FIX: Use ai.models.generateContent and provide the model name directly.
    // FIX: Use 'gemini-2.5-flash' model.
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: 'user', parts: [{ text: topic }] }],
        config: {
            // FIX: Use systemInstruction for persistent instructions.
            systemInstruction: getSystemInstruction(depth),
            // FIX: Use googleSearch tool for grounded results.
            tools: [{googleSearch: {}}],
        },
    });

    // FIX: Extract text directly from the 'text' property of the response.
    const rawText = response.text;

    if (!rawText) {
        throw new Error("Received an empty response from the AI.");
    }
    
    let parsedJson;
    try {
        // The response from the model with grounding may not be a clean JSON object.
        // We need to find the JSON block within the text.
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error("No JSON object found in the response:", rawText);
            throw new Error("Response did not contain a valid JSON object.");
        }
        parsedJson = JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.error("Failed to parse JSON response:", rawText);
        throw new Error(`Error parsing AI response: ${e instanceof Error ? e.message : String(e)}`);
    }

    const { summary, graphData } = parsedJson;
    
    if (!summary || !graphData || !graphData.nodes || !graphData.links) {
        throw new Error("AI response is missing required fields (summary, graphData).");
    }

    // FIX: Extract URLs from groundingChunks and list them.
    const sources = parseGroundedSources(response);
    
    return {
      summary,
      graphData,
      sources
    };

  } catch (error) {
    console.error("Error conducting research with Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred during AI research.");
  }
};

export const conductDocumentResearch = async (question: string, documentContent: string): Promise<ResearchResult> => {
  try {
      const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

      const prompt = `DOCUMENT CONTENT:\n---\n${documentContent}\n---\n\nQUESTION:\n${question}`;

      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
              systemInstruction: getDocumentSystemInstruction(),
          },
      });

      const rawText = response.text;

      if (!rawText) {
          throw new Error("Received an empty response from the AI.");
      }

      let parsedJson;
      try {
          const jsonMatch = rawText.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
              console.error("No JSON object found in the response:", rawText);
              throw new Error("Response did not contain a valid JSON object.");
          }
          parsedJson = JSON.parse(jsonMatch[0]);
      } catch (e) {
          console.error("Failed to parse JSON response:", rawText);
          throw new Error(`Error parsing AI response: ${e instanceof Error ? e.message : String(e)}`);
      }

      const { summary, graphData } = parsedJson;
      
      if (!summary || !graphData || !graphData.nodes || !graphData.links) {
          throw new Error("AI response is missing required fields (summary, graphData).");
      }
      
      return {
        summary,
        graphData,
        sources: [] 
      };

  } catch (error) {
      console.error("Error conducting research with Gemini API on document:", error);
      if (error instanceof Error) {
          throw new Error(`Gemini API Error: ${error.message}`);
      }
      throw new Error("An unknown error occurred during AI research on the document.");
  }
};
