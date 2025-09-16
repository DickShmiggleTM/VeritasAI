import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import type { Source, ResearchDepth, KnowledgeGraph } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const BASE_SYSTEM_INSTRUCTION = `You are 'Veritas', an advanced AI research agent specializing in the deep analysis of esoteric, occult, mystical, and metaphysical subjects. Your primary directive is to move beyond allegorical and metaphorical interpretations to provide a structured, synthesized understanding. When a user provides a topic, you must return a JSON object containing two fields: 'analysisText' and 'knowledgeGraph'.

1.  **analysisText**: This field must contain a detailed markdown-formatted analysis. Deconstruct the concept into its core principles, trace its lineage and key figures, analyze its practices, map its connections to other systems, and provide a synthesized conclusion.

2.  **knowledgeGraph**: This field must contain a graph representing the key entities and their relationships from your analysis. It should have 'nodes' and 'edges'.
    *   **Nodes**: Each node must have an 'id' (the entity name), a 'group' (one of 'Concept', 'Figure', 'Text', 'Practice', 'Location', 'Organization', 'Other'), and a 'connections' count (the number of edges connected to it).
    *   **Edges**: Each edge must link two nodes by their 'id' in 'source' and 'target' fields, and include a concise 'label' describing their relationship (e.g., 'influenced by', 'author of', 'is a type of').`;

const DEPTH_MODIFIERS: Record<ResearchDepth, string> = {
  surface: "\n\n**Depth Mandate: Surface.** Provide a concise, high-level summary (around 2-3 paragraphs) suitable for a quick introduction. Focus only on the most critical definitions and historical context. The knowledge graph should be small, with only core concepts.",
  moderate: "\n\n**Depth Mandate: Moderate.** Provide a balanced and detailed analysis covering all specified points comprehensively. The knowledge graph should be well-populated with key entities and relationships. This is the default, standard level of research.",
  deep: "\n\n**Depth Mandate: Deep.** Conduct an exhaustive, deep-dive analysis. Explore obscure connections, lesser-known figures, and nuanced evolution. The knowledge graph should be extensive, mapping subtle and complex relationships.",
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    analysisText: { type: Type.STRING },
    knowledgeGraph: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              group: { type: Type.STRING },
              connections: { type: Type.INTEGER },
            },
          },
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              source: { type: Type.STRING },
              target: { type: Type.STRING },
              label: { type: Type.STRING },
            },
          },
        },
      },
    },
  },
};

export const conductResearch = async (
  topic: string,
  depth: ResearchDepth
): Promise<{ result: string; sources: Source[]; graph: KnowledgeGraph }> => {
  const systemInstruction = BASE_SYSTEM_INSTRUCTION + DEPTH_MODIFIERS[depth];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: topic,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const parsedResponse = JSON.parse(response.text);
    const result = parsedResponse.analysisText || "No analysis text was generated.";
    const graph = parsedResponse.knowledgeGraph || { nodes: [], edges: [] };
    
    // The googleSearch tool, which provides sources, cannot be used with a JSON responseSchema.
    // Since the knowledge graph requires a schema, we cannot get sources and must return an empty array.
    const sources: Source[] = [];
    
    return { result, sources, graph };

  } catch (error) {
    console.error("Error in Gemini service:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    let userFriendlyMessage = `Failed to get response from Gemini API. ${errorMessage}`;
    if (errorMessage.includes("JSON")) {
      userFriendlyMessage = "The AI response was not in the expected format. Please try rephrasing your query."
    }
    throw new Error(userFriendlyMessage);
  }
};