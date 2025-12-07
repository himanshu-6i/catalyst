import { Type } from "@google/genai";
import * as d3 from 'd3';

// UI States
export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum AnalysisMode {
  FAST = 'FAST',
  DEEP_THINKING = 'DEEP_THINKING'
}

// Structured Data Types from Gemini
export interface ConceptNode {
  id: string;
  label: string;
  type: 'core' | 'risk' | 'opportunity' | 'action';
  description: string;
}

export interface ConceptLink {
  source: string;
  target: string;
  relationship: string;
}

export interface FeasibilityMetric {
  name: string;
  score: number; // 0-100
  reasoning: string;
}

export interface ProjectPhase {
  phase: string;
  duration_weeks: number;
  complexity: number;
}

export interface CatalystResponse {
  summary: string;
  nodes: ConceptNode[];
  links: ConceptLink[];
  metrics: FeasibilityMetric[];
  timeline: ProjectPhase[];
  risks_analysis?: string; // Only populated in deep thinking
}

// D3 Types
export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  type: 'core' | 'risk' | 'opportunity' | 'action';
  description: string;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  relationship: string;
}