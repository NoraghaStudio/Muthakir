import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from './Button';
import { ResultModal } from './ResultModal';
import { conductResearch } from '../services/geminiService';
import { ResearchResult } from '../types';

export const Researcher: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [wordCount, setWordCount] = useState<number>(500);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ResearchResult | null>(null);

  const handleResearch = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    try {
      const researchData = await conductResearch(topic, wordCount);
      setResult(researchData);
    } catch (error) {
      alert("حدث خطأ أثناء البحث.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    // Inject print styles for Portrait
    const style = document.createElement('style');
    style.innerHTML = `
      @page { size: portrait; margin: 10mm; }
    `;
    style.id = 'print-orientation';
    document.head.appendChild(style);
    
    window.print();
    
    document.head.removeChild(style);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="text-center mb-8 no-print">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">الباحث الأكاديمي</h2>
        <p className="text-slate-500">أداة ذكية للمساعدة في صياغة الأبحاث بناءً على مصادر موثوقة</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 max-w-2xl mx-auto">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700">عنوان البحث أو الموضوع</label>
          <input 
            type="text" 
            className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-lg"
            placeholder="مثال: تأثير الذكاء الاصطناعي على التعليم الجامعي"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </div>

        <div className="space-y-2">
           <label className="block text-sm font-medium text-slate-700">عدد الكلمات التقريبي</label>
           <div className="flex gap-2">
             {[300, 500, 1000, 1500].map((count) => (
               <button
                 key={count}
                 onClick={() => setWordCount(count)}
                 className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors
                   ${wordCount === count 
                     ? 'bg-indigo-600 text-white border-indigo-600' 
                     : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}
               >
                 {count}
               </button>
             ))}
           </div>
        </div>

        <Button 
          onClick={handleResearch} 
          isLoading={isLoading} 
          disabled={!topic.trim()}
          className="w-full py-4 text-lg"
        >
          بدء البحث
        </Button>
      </div>

      <ResultModal 
        isOpen={!!result} 
        onClose={() => setResult(null)} 
        title="معاينة البحث"
        onDownload={handlePrint}
      >
         {result && (
           <div className="document-paper mx-auto">
              <div className="document-paper-content">
                 <h1 className="text-center">{topic}</h1>
                 <ReactMarkdown>{result.content}</ReactMarkdown>
              </div>

              {result.sources.length > 0 && (
                <div className="document-paper-content mt-8 pt-8 border-t border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-4">المصادر والمراجع</h3>
                  <ul className="list-disc pr-5 space-y-2">
                    {result.sources.map((source, idx) => (
                      <li key={idx} className="text-slate-600 text-sm">
                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                          {source.title || source.uri}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="document-footer">
               تم إعداد هذا البحث بواسطة منصة <strong>مُذاكِر</strong> الذكية
             </div>
           </div>
         )}
      </ResultModal>
    </div>
  );
};