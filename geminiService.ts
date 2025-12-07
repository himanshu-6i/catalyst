import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CatalystResponse, AnalysisMode } from "../types";

// Initialize the client
// NOTE: Process.env.API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A high-level executive summary of the problem and proposed solution.",
    },
    nodes: {
      type: Type.ARRAY,
      description: "Key concepts, stakeholders, or action items extracted from the input.",
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          label: { type: Type.STRING },
          type: { type: Type.STRING, enum: ['core', 'risk', 'opportunity', 'action'] },
          description: { type: Type.STRING }
        },
        required: ['id', 'label', 'type', 'description']
      }
    },
    links: {
      type: Type.ARRAY,
      description: "Relationships between the nodes.",
      items: {
        type: Type.OBJECT,
        properties: {
          source: { type: Type.STRING, description: "ID of the source node" },
          target: { type: Type.STRING, description: "ID of the target node" },
          relationship: { type: Type.STRING }
        },
        required: ['source', 'target', 'relationship']
      }
    },
    metrics: {
      type: Type.ARRAY,
      description: "Feasibility and impact metrics based on the analysis.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "Score from 0 to 100" },
          reasoning: { type: Type.STRING }
        },
        required: ['name', 'score', 'reasoning']
      }
    },
    timeline: {
      type: Type.ARRAY,
      description: "Projected timeline phases.",
      items: {
        type: Type.OBJECT,
        properties: {
          phase: { type: Type.STRING },
          duration_weeks: { type: Type.NUMBER },
          complexity: { type: Type.NUMBER, description: "Complexity score 1-10" }
        },
        required: ['phase', 'duration_weeks', 'complexity']
      }
    },
    risks_analysis: {
      type: Type.STRING,
      description: "Detailed analysis of potential pitfalls (mostly for deep thinking)."
    }
  },
  required: ['summary', 'nodes', 'links', 'metrics', 'timeline']
};

export const analyzeProblem = async (
  promptText: string,
  imageData: string | null,
  mode: AnalysisMode
): Promise<CatalystResponse> => {
  
  const modelName = 'gemini-2.5-flash';

  const parts: any[] = [];
  
  if (imageData) {
    // Extract base64 data from data URL if present
    const cleanBase64 = imageData.split(',')[1] || imageData;
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg', // Assuming JPEG/PNG from input
        data: cleanBase64
      }
    });
  }

  parts.push({
    text: `
      You are Catalyst, an advanced AI systems architect. 
      Analyze the following problem statement, notes, or diagram.
      Break it down into a structured knowledge graph, assess feasibility, and plan a timeline.
      
      Input Context: ${promptText}
      
      ${mode === AnalysisMode.DEEP_THINKING ? "PERFORM DEEP REASONING. Consider edge cases, hidden costs, and long-term implications." : "Provide a rapid structural analysis."}
    `
  });

  try {
    const config: any = {
      responseMimeType: "application/json",
      responseSchema: RESPONSE_SCHEMA,
    };

    if (mode === AnalysisMode.DEEP_THINKING) {
      // Allocate budget for thinking
      config.thinkingConfig = { thinkingBudget: 4000 }; 
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: { parts },
      config: config
    });

    const text = response.text;
    if (!text) throw new Error("No response generated");

    const data = JSON.parse(text) as CatalystResponse;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};