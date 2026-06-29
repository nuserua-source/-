/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, Heart, Send, Sparkles, User, RefreshCw } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_INSTRUCTION = `
You are "Yauk Pha Gyi" (Big Bro/Brother-in-law AI), a wise, slightly older, and very supportive friend from Myanmar.
The user is venting their frustrations about life, friends changing, "seen but no reply" messages, and general loneliness or disappointment in people.

Your goals:
1. Listen empatheticly in Burmese (Unicode).
2. Give wise, brotherly advice that is realistic but comforting. 
3. Use a tone that is casual, brotherly, and authentic to Myanmar culture (e.g., using terms like "Yauk Pha", "Nyi Lay", "Jar Ma", etc., appropriately).
4. Sometimes include a deep or "savage" quote about friendship if it fits.
5. Keep responses concise and meaningful.

Always respond in Burmese.
`;

export default function App() {
  const [vent, setVent] = useState('');
  const [advice, setAdvice] = useState<{ text: string; q: string } | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [step, setStep] = useState<'welcome' | 'vent' | 'advice'>('welcome');

  const getAdvice = async () => {
    if (!vent.trim()) return;
    setIsTyping(true);
    setStep('advice');

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: vent,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.8,
        },
      });

      const result = response.text || "Yauk Pha Layရာ... ခဏတော့ စိတ်လျှော့ထားဦးနော်။ စကားလုံးတွေ ရှာမတွေ့သေးလို့ပါ။";
      
      // Attempt to split quote and advice if model follows implicit structure
      setAdvice({ text: result, q: "" });
    } catch (error) {
      console.error(error);
      setAdvice({ text: "အခုလောလောဆယ် Yauk Pha ကြီး လိုင်းမကောင်းလို့ နောက်မှ ထပ်ပြောကြရအောင်နော်။", q: "" });
    } finally {
      setIsTyping(false);
    }
  };

  const reset = () => {
    setVent('');
    setAdvice(null);
    setStep('welcome');
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-orange-500/30">
      <div className="atmosphere" />
      
      {/* Navigation / Header */}
      <nav className="fixed top-0 w-full p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
            <User size={16} className="text-orange-500" />
          </div>
          <span className="font-mono text-xs tracking-widest uppercase opacity-60">Yauk Pha Gyi AI</span>
        </div>
        <button 
          onClick={reset}
          className="p-2 hover:bg-white/5 rounded-full transition-colors opacity-60 hover:opacity-100"
        >
          <RefreshCw size={18} />
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-32 pb-20 overflow-hidden">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <h1 className="font-serif text-5xl md:text-7xl italic text-glow leading-tight">
                Friendships change,<br />
                <span className="text-orange-500/80">but life goes on.</span>
              </h1>
              <p className="font-sans text-white/50 max-w-md mx-auto text-sm leading-relaxed">
                Yauk Pha ရေ... စိတ်ထဲမှာ ရှိတာတွေ အကုန်ပြောချင်လား? 
                မင်းအတွက် အမြဲနားထောင်ပေးမယ့် အစ်ကိုတစ်ယောက် ဒီမှာရှိတယ်။
              </p>
              <button 
                id="start-venting"
                onClick={() => setStep('vent')}
                className="mt-8 px-10 py-4 glass rounded-full hover:bg-white/10 transition-all group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2 text-sm font-medium tracking-wide">
                  စပြောမယ် <Send size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          )}

          {step === 'vent' && (
            <motion.div 
              key="vent"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <h2 className="font-serif text-3xl italic opacity-80">ပြောပြပါဦး...</h2>
                <p className="text-white/40 text-sm">စိတ္ထဲမွာ ရှိတာတွေ အကုန်ချရေးလိုက်ပါ။ ဘယ်သူ့ကိုမှ ပြန်မပြောဘူး။</p>
              </div>
              <div className="relative group">
                <textarea 
                  autoFocus
                  value={vent}
                  onChange={(e) => setVent(e.target.value)}
                  placeholder="ဥပမာ- သူငယ်ချင်းတွေက အရင်လိုမဟုတ်တော့ဘူး..."
                  className="w-full h-64 bg-white/5 border border-white/10 rounded-3xl p-8 focus:outline-none focus:border-orange-500/50 transition-all font-sans text-lg placeholder:text-white/10 resize-none glass"
                />
                <button 
                  id="send-vent"
                  disabled={!vent.trim() || isTyping}
                  onClick={getAdvice}
                  className="absolute bottom-6 right-6 p-4 rounded-2xl bg-orange-500 text-black hover:scale-105 active:scale-95 transition-all disabled:opacity-30 disabled:scale-100"
                >
                  <Send size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 'advice' && (
            <motion.div 
              key="advice"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12 py-10"
            >
              {isTyping ? (
                <div className="flex flex-col items-center justify-center space-y-4 py-20">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-10 h-10 border-2 border-orange-500/20 border-t-orange-500 rounded-full"
                  />
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] animate-pulse">Yauk Pha ကြီး စဉ်းစားနေတယ်...</p>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="flex justify-start">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="max-w-[85%] glass p-8 rounded-3xl rounded-tl-none space-y-4 relative"
                    >
                      <Sparkles className="absolute -top-3 -left-3 text-orange-500 w-6 h-6" />
                      <div className="font-sans text-xl leading-relaxed text-white/90 whitespace-pre-wrap">
                        {advice?.text}
                      </div>
                    </motion.div>
                  </div>

                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="flex justify-center pt-8"
                  >
                    <button 
                      onClick={reset}
                      className="text-white/30 hover:text-white/60 transition-all text-xs font-mono uppercase tracking-widest flex items-center gap-2"
                    >
                      နောက်တစ်ခု ထပ်ပြောပြမယ် <RefreshCw size={12} />
                    </button>
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative footer */}
      <footer className="fixed bottom-0 w-full p-8 flex justify-center pointer-events-none opacity-20">
        <div className="flex gap-12 font-mono text-[9px] tracking-[0.4em] uppercase">
          <span>Acceptance</span>
          <span>Growth</span>
          <span>Wisdom</span>
        </div>
      </footer>
    </div>
  );
}
