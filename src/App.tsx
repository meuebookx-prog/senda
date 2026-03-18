/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  Compass, 
  Target, 
  Zap, 
  ShieldAlert, 
  Lightbulb, 
  RefreshCw,
  Heart,
  Moon,
  Sun,
  Star,
  Wind,
  Mountain,
  Waves
} from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---

interface Question {
  id: number;
  text: string;
  category: string;
}

interface QuizResult {
  archetype: string;
  purpose: string;
  careerPaths: string[];
  internalBlocks: string[];
  naturalStrengths: string[];
  recommendations: string[];
  personalizedMessage: string;
}

// --- Constants ---

const QUESTIONS: Question[] = [
  { id: 1, text: "Se você tivesse todo o tempo e dinheiro do mundo, o que faria com seus dias?", category: "propósito" },
  { id: 2, text: "Qual é o medo que mais te impede de agir hoje?", category: "medos" },
  { id: 3, text: "Em quais momentos você sente que o tempo 'para' e você entra em estado de fluxo?", category: "talentos" },
  { id: 4, text: "O que você mais valoriza em um relacionamento humano?", category: "valores" },
  { id: 5, text: "Se você pudesse deixar um único legado para o mundo, qual seria?", category: "propósito" },
  { id: 6, text: "Qual crítica você recebe com mais frequência e como ela te afeta?", category: "bloqueios" },
  { id: 7, text: "O que a sua criança interior diria sobre quem você se tornou?", category: "reflexão" },
  { id: 8, text: "Qual é a sua definição pessoal de felicidade?", category: "felicidade" },
  { id: 9, text: "Diante de um grande desafio, você costuma confiar na intuição ou na lógica?", category: "decisões" },
  { id: 10, text: "O que você sente que está faltando em sua vida neste exato momento?", category: "desejos" },
  { id: 11, text: "Qual é a sua relação com o silêncio e a solidão?", category: "espiritualidade" },
  { id: 12, text: "Se você soubesse que não poderia falhar, o que tentaria fazer agora?", category: "potencial" },
  { id: 13, text: "Quais são os três valores inegociáveis para você?", category: "valores" },
  { id: 14, text: "Como você lida com a incerteza do futuro?", category: "medos" },
  { id: 15, text: "Qual atividade te faz sentir mais útil para os outros?", category: "talentos" },
  { id: 16, text: "O que você mais admira em pessoas que você considera bem-sucedidas?", category: "inspiração" },
  { id: 17, text: "Qual é o seu maior arrependimento até agora e o que ele te ensinou?", category: "bloqueios" },
  { id: 18, text: "Como você se conecta com algo maior que você mesmo?", category: "espiritualidade" },
  { id: 19, text: "Se você tivesse que escolher uma palavra para definir sua essência, qual seria?", category: "essência" },
  { id: 20, text: "O que você está disposto a sacrificar para alcançar seus sonhos?", category: "compromisso" },
];

// --- Components ---

const ProgressBar = ({ current, total }: { current: number; total: number }) => (
  <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-8">
    <motion.div 
      className="h-full bg-emerald-400"
      initial={{ width: 0 }}
      animate={{ width: `${(current / total) * 100}%` }}
      transition={{ duration: 0.5 }}
    />
  </div>
);

export default function App() {
  const [step, setStep] = useState<'home' | 'intro' | 'quiz' | 'analyzing' | 'result' | 'final'>('home');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [result, setResult] = useState<QuizResult | null>(null);
  const [loadingText, setLoadingText] = useState("Sintonizando sua essência...");

  const ai = useMemo(() => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" }), []);

  useEffect(() => {
    if (step === 'analyzing') {
      const texts = [
        "Sintonizando sua essência...",
        "Mapeando padrões de pensamento...",
        "Consultando arquétipos ancestrais...",
        "Tecendo fios de propósito...",
        "Finalizando sua jornada de descoberta..."
      ];
      let i = 0;
      const interval = setInterval(() => {
        i = (i + 1) % texts.length;
        setLoadingText(texts[i]);
      }, 2500);
      
      generateAnalysis();
      
      return () => clearInterval(interval);
    }
  }, [step]);

  const generateAnalysis = async () => {
    try {
      const prompt = `
        Analise as seguintes respostas de um quiz de autoconhecimento profundo e gere um perfil detalhado.
        As respostas são:
        ${QUESTIONS.map(q => `Pergunta: ${q.text}\nResposta: ${answers[q.id]}`).join('\n\n')}

        O tom deve ser sábio, acolhedor, psicológico e espiritual.
        Gere um JSON com a seguinte estrutura:
        {
          "archetype": "Nome do arquétipo (ex: O Explorador, O Guardião, O Alquimista)",
          "purpose": "Uma frase profunda sobre o propósito de vida",
          "careerPaths": ["Caminho 1", "Caminho 2", "Caminho 3"],
          "internalBlocks": ["Bloqueio 1", "Bloqueio 2"],
          "naturalStrengths": ["Força 1", "Força 2", "Força 3"],
          "recommendations": ["Ação prática 1", "Ação prática 2"],
          "personalizedMessage": "Uma mensagem final inspiradora e personalizada de cerca de 3-4 frases."
        }
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              archetype: { type: Type.STRING },
              purpose: { type: Type.STRING },
              careerPaths: { type: Type.ARRAY, items: { type: Type.STRING } },
              internalBlocks: { type: Type.ARRAY, items: { type: Type.STRING } },
              naturalStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
              personalizedMessage: { type: Type.STRING },
            },
            required: ["archetype", "purpose", "careerPaths", "internalBlocks", "naturalStrengths", "recommendations", "personalizedMessage"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
      setStep('result');
    } catch (error) {
      console.error("Erro ao gerar análise:", error);
      // Fallback in case of error
      setResult({
        archetype: "O Buscador de Luz",
        purpose: "Encontrar harmonia entre o mundo material e a paz interior.",
        careerPaths: ["Educação", "Artes Terapêuticas", "Liderança Consciente"],
        internalBlocks: ["Medo do julgamento", "Dificuldade em dizer não"],
        naturalStrengths: ["Empatia profunda", "Visão estratégica", "Resiliência"],
        recommendations: ["Praticar meditação diária", "Escrever um diário de gratidão"],
        personalizedMessage: "Sua jornada está apenas começando. Confie na sua intuição e permita-se brilhar sem reservas."
      });
      setStep('result');
    }
  };

  const handleAnswer = (text: string) => {
    setAnswers({ ...answers, [QUESTIONS[currentQuestionIndex].id]: text });
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep('analyzing');
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResult(null);
    setStep('home');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 font-sans selection:bg-emerald-500/30 overflow-x-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-lg mx-auto px-6 py-12 min-h-screen flex flex-col">
        <AnimatePresence mode="wait">
          {step === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"
                />
                <Sparkles className="w-20 h-20 text-emerald-400 relative z-10" />
              </div>
              
              <div className="space-y-4">
                <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent">
                  Senda Interior
                </h1>
                <p className="text-lg text-slate-400 italic font-serif">
                  "Aquele que conhece os outros é sábio; aquele que conhece a si mesmo é iluminado."
                </p>
              </div>

              <button 
                onClick={() => setStep('intro')}
                className="group relative px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-105 flex items-center gap-2"
              >
                Iniciar Jornada
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center space-y-8"
            >
              <button 
                onClick={() => setStep('home')}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-emerald-400">O Propósito</h2>
                <div className="space-y-4 text-slate-300 leading-relaxed text-lg">
                  <p>
                    Bem-vindo a um espaço de silêncio e reflexão. Esta não é apenas uma série de perguntas, mas um espelho para sua alma.
                  </p>
                  <p>
                    Para encontrar clareza, pedimos que responda com total sinceridade. Não há respostas certas ou erradas, apenas a sua verdade.
                  </p>
                  <p className="text-emerald-400/80 font-medium">
                    Reserve 10 minutos para você. Desconecte-se do barulho externo e conecte-se com seu interior.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setStep('quiz')}
                className="w-full py-4 bg-slate-100 text-slate-900 font-bold rounded-2xl hover:bg-white transition-all shadow-xl"
              >
                Estou Pronto
              </button>
            </motion.div>
          )}

          {step === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <span className="text-sm font-mono text-emerald-400/60 uppercase tracking-widest">
                  Questão {currentQuestionIndex + 1} de {QUESTIONS.length}
                </span>
                <button 
                  onClick={() => currentQuestionIndex > 0 ? setCurrentQuestionIndex(currentQuestionIndex - 1) : setStep('intro')}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <ProgressBar current={currentQuestionIndex + 1} total={QUESTIONS.length} />

              <div className="flex-1 flex flex-col justify-center space-y-8">
                <motion.h3 
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl md:text-3xl font-medium leading-tight text-slate-100"
                >
                  {QUESTIONS[currentQuestionIndex].text}
                </motion.h3>

                <textarea 
                  autoFocus
                  value={answers[QUESTIONS[currentQuestionIndex].id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [QUESTIONS[currentQuestionIndex].id]: e.target.value })}
                  placeholder="Sua resposta..."
                  className="w-full h-40 bg-white/5 border border-white/10 rounded-2xl p-6 text-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all resize-none placeholder:text-slate-600"
                />

                <button 
                  disabled={!answers[QUESTIONS[currentQuestionIndex].id]?.trim()}
                  onClick={() => handleAnswer(answers[QUESTIONS[currentQuestionIndex].id])}
                  className="w-full py-4 bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  {currentQuestionIndex === QUESTIONS.length - 1 ? 'Finalizar Jornada' : 'Próxima Reflexão'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              <div className="relative w-32 h-32">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360],
                    borderRadius: ["20%", "50%", "20%"]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 border-2 border-emerald-500/30"
                />
                <motion.div 
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    rotate: [360, 180, 0],
                    borderRadius: ["50%", "20%", "50%"]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 border-2 border-indigo-500/30"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
                </div>
              </div>
              <p className="text-xl font-medium text-slate-300 animate-pulse">
                {loadingText}
              </p>
            </motion.div>
          )}

          {step === 'result' && result && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8 pb-12"
            >
              <div className="text-center space-y-4">
                <span className="text-emerald-400 font-mono text-sm tracking-widest uppercase">Seu Perfil Interior</span>
                <h2 className="text-4xl font-bold text-white">{result.archetype}</h2>
                <div className="h-1 w-20 bg-emerald-500 mx-auto rounded-full" />
              </div>

              <div className="grid gap-6">
                {/* Purpose */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-3">
                  <div className="flex items-center gap-3 text-emerald-400">
                    <Compass className="w-6 h-6" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Missão de Vida</h3>
                  </div>
                  <p className="text-lg italic text-slate-200 leading-relaxed">"{result.purpose}"</p>
                </div>

                {/* Strengths & Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-emerald-400">
                      <Zap className="w-6 h-6" />
                      <h3 className="font-bold uppercase tracking-wider text-sm">Pontos Fortes</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.naturalStrengths.map((s, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-rose-400">
                      <ShieldAlert className="w-6 h-6" />
                      <h3 className="font-bold uppercase tracking-wider text-sm">Bloqueios</h3>
                    </div>
                    <ul className="space-y-2">
                      {result.internalBlocks.map((b, i) => (
                        <li key={i} className="flex items-center gap-2 text-slate-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Careers */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-indigo-400">
                    <Target className="w-6 h-6" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Caminhos de Realização</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.careerPaths.map((c, i) => (
                      <span key={i} className="px-4 py-2 bg-indigo-500/20 text-indigo-300 rounded-full text-sm border border-indigo-500/30">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-3 text-amber-400">
                    <Lightbulb className="w-6 h-6" />
                    <h3 className="font-bold uppercase tracking-wider text-sm">Próximos Passos</h3>
                  </div>
                  <ul className="space-y-3">
                    {result.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-300">
                        <span className="text-amber-400 font-bold">{i + 1}.</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Personalized Message */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-indigo-500/20 border border-white/10 rounded-3xl p-8 text-center space-y-4">
                  <Heart className="w-8 h-8 text-rose-400 mx-auto" />
                  <p className="text-xl font-serif italic text-slate-100 leading-relaxed">
                    {result.personalizedMessage}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setStep('final')}
                className="w-full py-4 bg-emerald-500 text-slate-900 font-bold rounded-2xl hover:bg-emerald-400 transition-all shadow-xl"
              >
                Concluir Jornada
              </button>
            </motion.div>
          )}

          {step === 'final' && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-12"
            >
              <div className="space-y-6">
                <div className="flex justify-center gap-4">
                  <Moon className="w-8 h-8 text-indigo-400" />
                  <Sun className="w-8 h-8 text-amber-400" />
                  <Star className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-4xl font-bold">A Senda Continua</h2>
                <p className="text-lg text-slate-400 leading-relaxed max-w-sm mx-auto">
                  Este é apenas o começo de uma conversa eterna com você mesmo. Leve estas descobertas para o seu dia a dia e observe como sua realidade se transforma.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-8 w-full max-w-xs">
                <div className="flex flex-col items-center gap-2">
                  <Wind className="w-6 h-6 text-slate-500" />
                  <span className="text-[10px] uppercase tracking-tighter text-slate-600">Respire</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Mountain className="w-6 h-6 text-slate-500" />
                  <span className="text-[10px] uppercase tracking-tighter text-slate-600">Evolua</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Waves className="w-6 h-6 text-slate-500" />
                  <span className="text-[10px] uppercase tracking-tighter text-slate-600">Flua</span>
                </div>
              </div>

              <button 
                onClick={resetQuiz}
                className="text-emerald-400 font-bold hover:text-emerald-300 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Recomeçar Jornada
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 text-center text-slate-600 text-xs uppercase tracking-[0.2em]">
        &copy; {new Date().getFullYear()} Senda Interior • Sabedoria & Clareza
      </footer>
    </div>
  );
}
