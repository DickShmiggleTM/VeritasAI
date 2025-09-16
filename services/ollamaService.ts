import type { Source, ResearchDepth, KnowledgeGraph, SearchType } from '../types';

const OLLAMA_API_URL = 'http://localhost:11434/api/generate';

const BASE_SYSTEM_INSTRUCTION = `You are 'Veritas', an advanced AI research agent specializing in the deep analysis of esoteric, occult, mystical, and metaphysical subjects. Your primary directive is to move beyond allegorical and metaphorical interpretations to provide a structured, synthesized understanding.
When a user provides a topic, you must return a single JSON object wrapped in a markdown code block (\`\`\`json ... \`\`\`). This JSON object must contain two fields: 'analysisText' and 'knowledgeGraph'.

1.  **analysisText**: This field must contain a detailed markdown-formatted analysis. Deconstruct the concept into its core principles, trace its lineage and key figures, analyze its practices, map its connections to other systems, and provide a synthesized conclusion.

2.  **knowledgeGraph**: This field must contain a graph representing the key entities and their relationships from your analysis. It should have 'nodes' and 'edges'.
    *   **Nodes**: Each node must have an 'id' (the entity name), a 'group' (one of 'Concept', 'Figure', 'Text', 'Practice', 'Location', 'Organization', 'Other'), and a 'connections' count (the number of edges connected to it).
    *   **Edges**: Each edge must link two nodes by their 'id' in 'source' and 'target' fields, and include a concise 'label' describing their relationship (e.g., 'influenced by', 'author of', 'is a type of').`;

const DEPTH_MODIFIERS: Record<ResearchDepth, string> = {
  surface: "\n\n**Depth Mandate: Surface.** Provide a concise, high-level summary (around 2-3 paragraphs) suitable for a quick introduction. Focus only on the most critical definitions and historical context. The knowledge graph should be small, with only core concepts.",
  moderate: "\n\n**Depth Mandate: Moderate.** Provide a balanced and detailed analysis covering all specified points comprehensively. The knowledge graph should be well-populated with key entities and relationships. This is the default, standard level of research.",
  deep: "\n\n**Depth Mandate: Deep.** Conduct an exhaustive, deep-dive analysis. Explore obscure connections, lesser-known figures, and nuanced evolution. The knowledge graph should be extensive, mapping subtle and complex relationships.",
};

export const conductResearch = async (
  topic: string,
  depth: ResearchDepth,
  searchType: SearchType, // Note: Ollama doesn't have a built-in search tool like Gemini.
  model: string,
  documentContext: string
): Promise<{ result: string; sources: Source[]; graph: KnowledgeGraph }> => {
  const documentInstruction = documentContext
    ? `\n\nYou have been provided with the following documents. Use them as a primary source for your analysis.\n\n---BEGIN DOCUMENTS---\n${documentContext}\n---END DOCUMENTS---\n`
    : '';
  const systemInstruction = documentInstruction + BASE_SYSTEM_INSTRUCTION + DEPTH_MODIFIERS[depth];

  // The concept of "deep search" by modifying the query is a client-side implementation
  // and can be kept. However, the Ollama model itself won't perform a live web search.
  let searchQuery = topic;
  if (searchType === 'deep') {
    const deepSearchSites = [
      'arxiv.org', 'jstor.org', 'gutenberg.org', 'sacred-texts.com', 'wikipedia.org',
    ];
    searchQuery = `${topic} (search within these sites: ${deepSearchSites.join(', ')})`;
  }

  try {
    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        prompt: searchQuery,
        system: systemInstruction,
        stream: false, // For simplicity, we'll get the full response at once.
        format: 'json',
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Ollama API request failed with status ${response.status}: ${errorBody}`);
    }

    const data = await response.json();
    const responseContent = data.response;

    // The entire response from Ollama is expected to be a JSON string.
    const parsedResponse = JSON.parse(responseContent);

    const analysisResult = parsedResponse.analysisText || "No analysis text was generated.";
    const graph = parsedResponse.knowledgeGraph || { nodes: [], edges: [] };

    // Ollama doesn't have a built-in search tool, so sources will be empty.
    const sources: Source[] = [];

    return { result: analysisResult, sources, graph };

  } catch (error) {
    console.error("Error in Ollama service:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    let userFriendlyMessage = `Failed to get response from Ollama API. ${errorMessage}`;
    if (errorMessage.includes("Failed to fetch")) {
        userFriendlyMessage = "Could not connect to Ollama. Please ensure Ollama is running and accessible at " + OLLAMA_API_URL;
    }
    throw new Error(userFriendlyMessage);
  }
};
