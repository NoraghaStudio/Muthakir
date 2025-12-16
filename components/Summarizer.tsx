import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FileUpload } from './FileUpload';
import { Button } from './Button';
import { fileToBase64, generateSummary } from '../services/geminiService';
import { SummaryLevel, Language } from '../types';
import { ResultModal } from './ResultModal';

export const Summarizer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>(SummaryLevel.MEDIUM);
  const [sourceLang, setSourceLang] = useState<Language>(Language.ENGLISH);
  const [targetLang, setTargetLang] = useState<Language>(Language.ARABIC);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const summary = await generateSummary(base64, file.type, summaryLevel, sourceLang, targetLang);
      setResult(summary);
    } catch (error) {
      alert("حدث خطأ أثناء التلخيص. يرجى المحاولة مرة أخرى.");
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
    
    // Clean up
    document.head.removeChild(style);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      <div className="text-center mb-8 no-print">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">الملخص الذكي</h2>
        <p className="text-slate-500">حول ملفاتك المعقدة إلى ملخصات سهلة القراءة والدراسة</p>
      </div>

      {!result && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 max-w-4xl mx-auto">
          <FileUpload onFileSelect={setFile} />

          {file && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700">مستوى التلخيص</label>
                <select 
                  className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  value={summaryLevel}
                  onChange={(e) => setSummaryLevel(e.target.value as SummaryLevel)}
                >
                  {Object.values(SummaryLevel).map((level) => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">لغة الملف الأصلي</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none"
                    value={sourceLang}
                    onChange={(e) => setSourceLang(e.target.value as Language)}
                  >
                    <option value={Language.ARABIC}>العربية</option>
                    <option value={Language.ENGLISH}>الإنجليزية</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">لغة الملخص</label>
                  <select 
                    className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none"
                    value={targetLang}
                    onChange={(e) => setTargetLang(e.target.value as Language)}
                  >
                    <option value={Language.ARABIC}>العربية فقط</option>
                    <option value={Language.ENGLISH}>الإنجليزية فقط</option>
                    <option value={Language.ENGLISH_ARABIC}>الإنجليزية مع ترجمة عربية</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2 pt-4">
                <Button 
                  onClick={handleGenerate} 
                  isLoading={isLoading} 
                  className="w-full py-4 text-lg shadow-lg shadow-indigo-200"
                >
                  ابدأ التلخيص
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <ResultModal
        isOpen={!!result}
        onClose={() => setResult(null)}
        title="الملخص"
        onDownload={handlePrint}
      >
          {result && (
            <div className="document-paper">
              <div className="document-paper-content markdown-body" dir="auto" style={{ lineHeight: '2' }}>
                <h1 className="text-center mb-8 border-b-4 border-indigo-500 pb-4">ملخص المحاضرة</h1>
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
              <div className="document-footer">
                تم إنشاء هذا الملخص بواسطة منصة <strong>مُذاكِر</strong> الذكية
              </div>
            </div>
          )}
      </ResultModal>
    </div>
  );
};