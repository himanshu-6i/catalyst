import React, { useState, useRef, useEffect } from 'react';
import { 
  BrainCircuit, 
  Upload, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  Loader2, 
  FileText, 
  Image as ImageIcon,
  Zap,
  AlertTriangle
} from 'lucide-react';
import { analyzeProblem } from './services/geminiService';
import { AppState, AnalysisMode, CatalystResponse } from './types';
import Visualizer from './components/Visualizer';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  // State
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mode, setMode] = useState<AnalysisMode>(AnalysisMode.FAST);
  const [result, setResult] = useState<CatalystResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!inputText && !selectedImage) return;

    setAppState(AppState.ANALYZING);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await analyzeProblem(inputText, selectedImage, mode);
      setResult(data);
      setAppState(AppState.SUCCESS);
    } catch (err) {
      setAppState(AppState.ERROR);
      setErrorMsg("Failed to analyze. Please try again later or check your API limit.");
    }
  };

  const reset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500 selection:text-white pb-20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-lg">
              <BrainCircuit className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
              Catalyst
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-400">
            <span className="hidden sm:inline">Powered by Gemini 2.5 Flash</span>
            <div className="h-4 w-px bg-zinc-800"></div>
            <a href="#" className="hover:text-white transition-colors">Documentation</a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 px-4 max-w-7xl mx-auto">
        
        {/* Input Section */}
        {appState === AppState.IDLE && (
          <div className="max-w-3xl mx-auto mt-10 animate-fade-in-up">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-zinc-500">
                Turn chaos into structure.
              </h1>
              <p className="text-lg text-zinc-400">
                Upload raw notes, whiteboard photos, or complex problem statements. 
                Catalyst uses multimodal reasoning to generate actionable project plans and knowledge graphs.
              </p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 backdrop-blur-sm shadow-2xl">
              <textarea
                className="w-full bg-transparent border-none text-lg text-white placeholder-zinc-600 focus:ring-0 resize-none h-32"
                placeholder="Describe your project, problem, or paste messy notes here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              
              {selectedImage && (
                <div className="mb-4 relative inline-block group">
                  <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-zinc-700" />
                  <button 
                    onClick={() => setSelectedImage(null)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-3 h-3 flex items-center justify-center font-bold">×</div>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-zinc-800 gap-4">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors flex items-center gap-2"
                  >
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Add Image</span>
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  
                  <div className="h-6 w-px bg-zinc-800 mx-2"></div>

                  <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800">
                    <button
                      onClick={() => setMode(AnalysisMode.FAST)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${mode === AnalysisMode.FAST ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      Fast
                    </button>
                    <button
                      onClick={() => setMode(AnalysisMode.DEEP_THINKING)}
                      className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${mode === AnalysisMode.DEEP_THINKING ? 'bg-indigo-500/20 text-indigo-300' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Deep Think
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={!inputText && !selectedImage}
                  className="w-full sm:w-auto bg-white text-black px-6 py-2.5 rounded-lg font-semibold hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  Analyze <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 text-zinc-500 text-sm">
              <div className="flex flex-col items-center text-center p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                <FileText className="w-6 h-6 mb-2 text-indigo-500" />
                <span>Summarize & Structure</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                <Activity className="w-6 h-6 mb-2 text-emerald-500" />
                <span>Assess Feasibility</span>
              </div>
              <div className="flex flex-col items-center text-center p-4 bg-zinc-900/30 rounded-xl border border-white/5">
                <Zap className="w-6 h-6 mb-2 text-amber-500" />
                <span>Identify Risks</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {appState === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
             <div className="relative">
               <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
               <Loader2 className="w-16 h-16 text-indigo-500 animate-spin relative z-10" />
             </div>
             <h2 className="mt-8 text-2xl font-bold">Analyzing Context</h2>
             <p className="text-zinc-400 mt-2 text-center max-w-md">
               {mode === AnalysisMode.DEEP_THINKING 
                 ? "Gemini is thinking deeply about edge cases and logic gaps..." 
                 : "Structuring your data into a knowledge graph..."}
             </p>
          </div>
        )}

        {/* Results View */}
        {appState === AppState.SUCCESS && result && (
          <div className="animate-fade-in pb-10">
            
            {/* Top Summary Bar */}
            <div className="mb-8 p-6 bg-gradient-to-r from-zinc-900 to-zinc-900/50 rounded-2xl border border-zinc-800">
               <div className="flex flex-col md:flex-row gap-6">
                 <div className="flex-1">
                   <h2 className="text-zinc-400 text-sm font-mono mb-2 uppercase tracking-wider">Executive Summary</h2>
                   <p className="text-lg text-zinc-100 leading-relaxed">{result.summary}</p>
                 </div>
                 {result.risks_analysis && (
                   <div className="md:w-1/3 bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
                        <AlertTriangle className="w-4 h-4" /> Risk Analysis
                      </div>
                      <p className="text-sm text-red-200/80">{result.risks_analysis}</p>
                   </div>
                 )}
               </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left Col: Visualizer (Takes 2 cols) */}
              <div className="xl:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold">Knowledge Graph</h3>
                  <span className="text-xs text-zinc-500 border border-zinc-800 px-2 py-1 rounded">Interactive</span>
                </div>
                <Visualizer nodes={result.nodes} links={result.links} />
                
                {/* Metrics Dashboard */}
                <Dashboard metrics={result.metrics} timeline={result.timeline} />
              </div>

              {/* Right Col: List Details */}
              <div className="xl:col-span-1 space-y-6">
                <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-6 backdrop-blur-sm h-full max-h-[1000px] overflow-y-auto">
                  <h3 className="text-lg font-bold mb-4 sticky top-0 bg-zinc-900/50 backdrop-blur-xl py-2 z-10">Key Entities</h3>
                  <div className="space-y-4">
                    {result.nodes.map((node, idx) => (
                      <div key={idx} className="p-4 rounded-lg bg-black/40 border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-zinc-200">{node.label}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide font-medium
                            ${node.type === 'core' ? 'bg-blue-500/20 text-blue-300' : 
                              node.type === 'risk' ? 'bg-red-500/20 text-red-300' :
                              node.type === 'opportunity' ? 'bg-emerald-500/20 text-emerald-300' :
                              'bg-amber-500/20 text-amber-300'
                            }`}>
                            {node.type}
                          </span>
                        </div>
                        <p className="text-sm text-zinc-400">{node.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Error State */}
        {appState === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center">
             <div className="bg-red-500/10 p-4 rounded-full mb-4">
               <AlertTriangle className="w-10 h-10 text-red-500" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Analysis Failed</h3>
             <p className="text-zinc-400 max-w-md mb-6">{errorMsg}</p>
             <button 
               onClick={reset}
               className="bg-white text-black px-6 py-2 rounded-lg font-semibold hover:bg-zinc-200"
             >
               Try Again
             </button>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;