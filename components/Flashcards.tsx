import React, { useState } from 'react';
import { FileUpload } from './FileUpload';
import { Button } from './Button';
import { fileToBase64, generateFlashcards } from '../services/geminiService';
import { Flashcard } from '../types';

export const Flashcards: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [flippedIndices, setFlippedIndices] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const generatedCards = await generateFlashcards(base64, file.type);
      setCards(generatedCards);
    } catch (error) {
      alert("حدث خطأ أثناء إنشاء البطاقات. حاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFlip = (index: number) => {
    const newFlipped = new Set(flippedIndices);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedIndices(newFlipped);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="text-center mb-8 no-print">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">البطاقات التعليمية (Flashcards)</h2>
        <p className="text-slate-500">احفظ المعلومات بسرعة عبر بطاقات المذاكرة الذكية</p>
      </div>

      {cards.length === 0 && (
        <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <FileUpload onFileSelect={setFile} label="ارفع المحاضرة لصنع البطاقات" />
          {file && (
            <Button onClick={handleGenerate} isLoading={isLoading} className="w-full py-4 text-lg">
              إنشاء البطاقات
            </Button>
          )}
        </div>
      )}

      {cards.length > 0 && (
        <div className="space-y-6">
          <div className="flex justify-between items-center no-print px-4">
             <Button variant="outline" onClick={() => { setCards([]); setFile(null); }} size="sm">
               ملف جديد
             </Button>
             <span className="text-slate-500 font-medium">{cards.length} بطاقة</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
            {cards.map((card, idx) => (
              <div 
                key={idx} 
                className="group h-80 perspective cursor-pointer"
                onClick={() => toggleFlip(idx)}
              >
                <div className={`relative preserve-3d w-full h-full duration-500 transition-transform ${flippedIndices.has(idx) ? 'rotate-y-180' : ''}`}>
                  {/* Front */}
                  <div className="absolute backface-hidden w-full h-full bg-white rounded-3xl shadow-sm border-2 border-slate-100 p-8 flex flex-col items-center justify-between hover:border-indigo-300 transition-colors">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold tracking-wide">
                      السؤال
                    </span>
                    <p className="text-2xl font-bold text-slate-800 text-center leading-relaxed">
                      {card.front}
                    </p>
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      اقلب للإجابة
                    </span>
                  </div>
                  
                  {/* Back */}
                  <div className="absolute backface-hidden rotate-y-180 w-full h-full bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-3xl shadow-xl p-8 flex flex-col items-center justify-between text-white">
                    <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-sm font-bold tracking-wide backdrop-blur-sm">
                      الإجابة
                    </span>
                    <div className="flex-1 flex items-center justify-center">
                       <p className="text-xl font-medium text-center leading-relaxed">
                         {card.back}
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};