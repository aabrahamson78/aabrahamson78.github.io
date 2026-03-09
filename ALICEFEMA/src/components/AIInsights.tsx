import React, { useState } from 'react';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { ValidRegistration } from '../types';
import Markdown from 'react-markdown';

interface AIInsightsProps {
  regs: ValidRegistration[];
  totalRegs: number;
  totalApproved: number;
  totalAmount: number;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ regs, totalRegs, totalApproved, totalAmount }) => {
  const [insight, setInsight] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      // Prepare a concise summary of the data for the prompt
      const sampleSize = regs.length;
      const topCounties = Object.entries(
        regs.reduce((acc: Record<string, number>, r) => {
          acc[r.county] = (acc[r.county] || 0) + 1;
          return acc;
        }, {})
      ).sort(([, a], [, b]) => (b as number) - (a as number)).slice(0, 3).map(([name]) => name).join(', ');

      const ageGroups = regs.reduce((acc: Record<string, number>, r) => {
        const age = Number(r.applicantAge);
        const group = age < 30 ? 'Young' : age < 60 ? 'Adult' : 'Senior';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {});

      const prompt = `
        Analyze this FEMA Disaster Assistance data summary:
        - Total Registrations: ${totalRegs}
        - Approved Households: ${totalApproved}
        - Total Assistance Amount: $${totalAmount.toLocaleString()}
        - Sample Data Size: ${sampleSize} records
        - Top Impacted Counties (Sample): ${topCounties}
        - Age Distribution (Sample): ${JSON.stringify(ageGroups)}
        
        Provide a concise (2-3 sentences) professional insight report for emergency management. 
        Focus on trends, vulnerable populations (like seniors), or assistance gaps. 
        Be direct and data-driven. Do not use generic filler.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setInsight(response.text || "No insight generated.");
    } catch (err) {
      console.error("AI Insight Error:", err);
      setError("Failed to generate AI insight. Please check your API configuration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 rounded-xl">
            <Sparkles className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">AI Data Intelligence</h3>
        </div>
        {!insight && !isLoading && (
          <button
            onClick={generateInsight}
            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-1"
          >
            Analyze Data
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <p className="text-xs text-gray-500 font-medium animate-pulse">Gemini is analyzing trends...</p>
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl text-red-700 text-xs">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : insight ? (
        <div className="prose prose-sm max-w-none">
          <div className="text-sm text-gray-700 leading-relaxed italic">
            <Markdown>{insight}</Markdown>
          </div>
          <button
            onClick={() => setInsight(null)}
            className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
          >
            Clear Analysis
          </button>
        </div>
      ) : (
        <div className="py-4 text-center">
          <p className="text-xs text-gray-400 italic">Click "Analyze Data" to generate a smart summary of the current filtered dataset.</p>
        </div>
      )}

      {/* Decorative background element */}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
    </div>
  );
};
