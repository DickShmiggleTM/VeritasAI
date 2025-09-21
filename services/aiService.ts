import { GoogleGenAI, Type, Part } from "@google/genai";
import type { ResearchDepth, ResearchResult, Settings } from '../types';

const researchResultSchema = {
    type: Type.OBJECT,
    properties: {
        phenomenologicalSummary: { type: Type.STRING, description: "A concise summary of the phenomenon, event, or concept being analyzed." },
        metaphysicalFrameworkAnalysis: { type: Type.STRING, description: "Analysis of the underlying metaphysical assumptions and implications." },
        symbolicResonanceMapping: { type: Type.STRING, description: "Mapping of symbolic connections and resonances across different domains." },
        archetypeFrequencyAnalysis: { type: Type.STRING, description: "Identification and analysis of archetypal patterns present." },
        technologyDeconstruction: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Deconstruction of the 'technology' involved." },
        firstPrinciplesHypothesis: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hypotheses derived from first-principles thinking." },
        experimentalProtocols: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Suggestions for experiments or protocols to test the hypotheses." },
        sources: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    url: { type: Type.STRING },
                    justification: { type: Type.STRING },
                    confidenceScore: { type: Type.NUMBER },
                },
                required: ["title", "url", "justification", "confidenceScore"]
            }
        },
        knowledgeGraph: {
            type: Type.OBJECT,
            properties: {
                nodes: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, name: { type: Type.STRING }, type: { type: Type.STRING }, details: { type: Type.STRING } }, required: ["id", "name", "type", "details"] } },
                links: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { source: { type: Type.STRING }, target: { type: Type.STRING }, relationship: { type: Type.STRING } }, required: ["source", "target", "relationship"] } }
            },
            required: ["nodes", "links"]
        }
    },
    required: ["phenomenologicalSummary", "metaphysicalFrameworkAnalysis", "symbolicResonanceMapping", "archetypeFrequencyAnalysis", "technologyDeconstruction", "firstPrinciplesHypothesis", "experimentalProtocols", "sources", "knowledgeGraph"]
};

function getJsonSchemaAsText() {
    return `Your entire response must be a single, valid JSON object that strictly adheres to the following structure. Do not include any markdown formatting like \`\`\`json.
    {
      "phenomenologicalSummary": "string",
      "metaphysicalFrameworkAnalysis": "string",
      "symbolicResonanceMapping": "string",
      "archetypeFrequencyAnalysis": "string",
      "technologyDeconstruction": ["string"],
      "firstPrinciplesHypothesis": ["string"],
      "experimentalProtocols": ["string"],
      "sources": [{ "title": "string", "url": "string", "justification": "string", "confidenceScore": "number (0-100)" }],
      "knowledgeGraph": { "nodes": [{ "id": "string", "name": "string", "type": "string", "details": "string" }], "links": [{ "source": "string", "target": "string", "relationship": "string" }] }
    }`;
}

function constructPrompt(topic: string, depth: ResearchDepth): string {
    const depthInstruction = {
        surface: 'Provide a high-level, surface overview. Be concise and focus on the most critical points.',
        moderate: 'Provide a detailed and well-rounded exploration. Cover key aspects, relationships, and some nuances.',
        deep: 'Provide a comprehensive, deep-dive analysis. Explore subtleties, esoteric connections, and profound implications.',
    }[depth];

    return `You are Codex Veritas, a quantum-archaeological AI. Analyze the inquiry: "${topic}".
    Depth of analysis: ${depthInstruction}.
    If an image is provided, incorporate its symbolism as a primary subject.
    Generate a response structured *exactly* according to the provided JSON schema.
    ${getJsonSchemaAsText()}`;
}

async function performGeminiResearch(prompt: string, model: string, imagePart?: Part): Promise<ResearchResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    const contents: Part[] = [{ text: prompt }];
    if (imagePart) contents.push(imagePart);

    const response = await ai.models.generateContent({
        model: model,
        contents: { parts: contents },
        config: {
            responseMimeType: "application/json",
            responseSchema: researchResultSchema,
        },
    });
    return JSON.parse(response.text);
}

async function performOllamaResearch(prompt: string, settings: Settings, imageBase64?: string): Promise<ResearchResult> {
    if (!settings.ollama.serverUrl || !settings.models.ollama) {
        throw new Error("Ollama server URL or model is not configured.");
    }
    const images = imageBase64 ? [imageBase64] : [];
    const response = await fetch(`${settings.ollama.serverUrl}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: settings.models.ollama,
            prompt,
            images,
            format: 'json',
            stream: false,
        }),
    });
    if (!response.ok) {
        throw new Error(`Ollama API error (${response.status}): ${await response.text()}`);
    }
    const data = await response.json();
    return JSON.parse(data.response);
}

async function performCohereResearch(apiKey: string, model: string, prompt: string, imageBase64?: string): Promise<ResearchResult> {
    if (imageBase64) {
        throw new Error("Image analysis is not currently supported for the Cohere provider in this application.");
    }
    if (!apiKey || !model) {
        throw new Error("Cohere API key or model is not configured.");
    }
    const response = await fetch('https://api.cohere.com/v1/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            model: model,
            message: prompt,
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        if (response.status === 401) throw new Error(`Cohere API error (401): Invalid API Key.`);
        if (response.status === 429) throw new Error(`Cohere API error (429): Rate limit exceeded.`);
        throw new Error(`Cohere API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    // The JSON string is in the 'text' field of the response
    return JSON.parse(data.text);
}


async function performOpenAICompatibleResearch(baseURL: string, apiKey: string, model: string, prompt: string, imageBase64?: string, mimeType?: string): Promise<ResearchResult> {
    if (!apiKey || !model) {
        throw new Error(`${baseURL} API key or model is not configured.`);
    }

    const content: any[] = [{ type: "text", text: prompt }];
    if (imageBase64 && mimeType) {
        content.push({ type: "image_url", image_url: { url: `data:${mimeType};base64,${imageBase64}` }});
    }

    const response = await fetch(`${baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: 'user', content }],
            response_format: { type: "json_object" },
        }),
    });

    if (!response.ok) {
        const errorBody = await response.text();
        const serviceName = new URL(baseURL).hostname;
        if (response.status === 401) throw new Error(`${serviceName} API error (401): Invalid API Key.`);
        if (response.status === 402) throw new Error(`${serviceName} API error (402): Insufficient Balance.`);
        if (response.status === 429) throw new Error(`${serviceName} API error (429): Rate limit exceeded.`);
        throw new Error(`${serviceName} API error (${response.status}): ${errorBody}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

export async function conductResearch(
    topic: string,
    depth: ResearchDepth,
    settings: Settings,
    imageBase64?: string,
    mimeType?: string
): Promise<ResearchResult> {
    const prompt = constructPrompt(topic || "the provided image", depth);
    let imagePart: Part | undefined;
    if (imageBase64 && mimeType) {
        imagePart = { inlineData: { data: imageBase64, mimeType: mimeType } };
    }

    try {
        switch (settings.provider) {
            case 'google':
                return await performGeminiResearch(prompt, settings.models.google, imagePart);
            case 'ollama':
                return await performOllamaResearch(prompt, settings, imageBase64);
            case 'mistral':
                return await performOpenAICompatibleResearch('https://api.mistral.ai', settings.apiKeys.mistral, settings.models.mistral, prompt, imageBase64, mimeType);
            case 'cohere':
                return await performCohereResearch(settings.apiKeys.cohere, settings.models.cohere, prompt, imageBase64);
            case 'openrouter':
                return await performOpenAICompatibleResearch('https://openrouter.ai/api', settings.apiKeys.openrouter, settings.models.openrouter, prompt, imageBase64, mimeType);
            case 'huggingface':
                 return await performOpenAICompatibleResearch('https://api-inference.huggingface.co', settings.apiKeys.huggingface, settings.models.huggingface, prompt, imageBase64, mimeType);
            case 'chutes':
                return await performOpenAICompatibleResearch('https://api.chutes.ai', settings.apiKeys.chutes, settings.models.chutes, prompt, imageBase64, mimeType);
            default:
                throw new Error(`Unsupported provider: ${settings.provider}`);
        }
    } catch(err) {
        console.error(`Error performing research with ${settings.provider}:`, err);
        throw new Error(`Failed to get a response from the ${settings.provider} service. Check your settings and network connection. ${err.message}`);
    }
}
