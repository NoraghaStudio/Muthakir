import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FileUpload } from './FileUpload';
import { Button } from './Button';
import { fileToBase64, generateQuiz, analyzeQuizWeaknesses } from '../services/geminiService';
import { QuizQuestion, QuizDifficulty, QuizAnalysis } from '../types';

export const Quizzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Config
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState<QuizDifficulty>(QuizDifficulty.MEDIUM);
  
  // Analysis
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<QuizAnalysis | null>(null);

  const handleGenerate = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const base64 = await fileToBase64(file);
      const generatedQuiz = await generateQuiz(base64, file.type, numQuestions, difficulty);
      setQuestions(generatedQuiz);
    } catch (error) {
      alert("حدث خطأ أثناء إنشاء الاختبار.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAnswer = (option: string) => {
    if (showResults) return;
    setSelectedAnswers(prev => ({...prev, [currentQIndex]: option}));
  };

  const handleFinishQuiz = async () => {
    setShowResults(true);
    
    // Auto-analyze weak points if there are wrong answers
    const wrongIndices = questions.map((q, i) => selectedAnswers[i] !== q.answer ? i : -1).filter(i => i !== -1);
    
    if (wrongIndices.length > 0) {
      setIsAnalyzing(true);
      try {
        const result = await analyzeQuizWeaknesses(questions, wrongIndices);
        setAnalysis(result);
      } catch (e) {
        console.error(e);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.answer) score++;
    });
    return score;
  };

  const score = calculateScore();
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

  const chartData = [
    { name: 'الإجابات الصحيحة', value: score },
    { name: 'الإجابات الخاطئة', value: questions.length - score },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">اختبر معلوماتك</h2>
        <p className="text-slate-500">قيم مستوى فهمك للمادة الدراسية عبر اختبار ذكي</p>
      </div>

      {questions.length === 0 && (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6">
          <FileUpload onFileSelect={setFile} label="ارفع الدرس للاختبار" />
          
          {file && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-slate-700">عدد الأسئلة</label>
                 <select 
                   value={numQuestions}
                   onChange={(e) => setNumQuestions(Number(e.target.value))}
                   className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                 >
                   <option value={5}>5 أسئلة</option>
                   <option value={10}>10 أسئلة</option>
                   <option value={15}>15 سؤال</option>
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-slate-700">مستوى الصعوبة</label>
                 <select 
                   value={difficulty}
                   onChange={(e) => setDifficulty(e.target.value as QuizDifficulty)}
                   className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                 >
                   {Object.values(QuizDifficulty).map(d => (
                     <option key={d} value={d}>{d}</option>
                   ))}
                 </select>
               </div>
            </div>
          )}

          {file && (
            <Button onClick={handleGenerate} isLoading={isLoading} className="w-full py-4 text-lg">
              بدء الاختبار
            </Button>
          )}
        </div>
      )}

      {questions.length > 0 && !showResults && (
        <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 min-h-[400px] flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6 text-slate-400 text-sm font-medium">
              <span>السؤال {currentQIndex + 1} من {questions.length}</span>
              <span className={`px-3 py-1 rounded-full ${selectedAnswers[currentQIndex] ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100'}`}>
                {selectedAnswers[currentQIndex] ? 'تمت الإجابة' : 'قيد الانتظار'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 mb-8 leading-relaxed">
              {questions[currentQIndex].question}
            </h3>

            <div className="space-y-3">
              {questions[currentQIndex].options.map((option, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSelectAnswer(option)}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center
                    ${selectedAnswers[currentQIndex] === option 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 mr-4 ml-4 flex items-center justify-center
                     ${selectedAnswers[currentQIndex] === option ? 'border-indigo-500' : 'border-slate-300'}`}>
                     {selectedAnswers[currentQIndex] === option && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                  </div>
                  {option}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
             <Button 
                variant="outline" 
                onClick={() => setCurrentQIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
             >
                السابق
             </Button>

             {currentQIndex === questions.length - 1 ? (
               <Button 
                 onClick={handleFinishQuiz}
                 disabled={Object.keys(selectedAnswers).length < questions.length}
               >
                 إنهاء الاختبار
               </Button>
             ) : (
               <Button 
                 onClick={() => setCurrentQIndex(prev => Math.min(questions.length - 1, prev + 1))}
               >
                 التالي
               </Button>
             )}
          </div>
        </div>
      )}

      {showResults && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-md border border-slate-100 animate-fade-in">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-800 mb-2">نتيجة الاختبار</h3>
              <div className={`text-5xl font-extrabold mb-2 ${percentage >= 70 ? 'text-emerald-500' : 'text-red-500'}`}>
                {percentage}%
              </div>
              <p className="text-slate-500">{percentage >= 70 ? 'ممتاز! واصل التقدم' : 'تحتاج لمراجعة بعض النقاط'}</p>
            </div>

            <div className="h-64 w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" tick={{fontFamily: 'Cairo'}} />
                  <YAxis />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '12px', fontFamily: 'Cairo'}} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* AI Weakness Analysis */}
          {(isAnalyzing || analysis) && (
             <div className="bg-indigo-50 rounded-3xl p-8 border border-indigo-100 animate-fade-in">
                <div className="flex items-center gap-3 mb-4">
                   <div className="bg-indigo-600 p-2 rounded-lg text-white">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                   <h3 className="text-xl font-bold text-indigo-900">تحليل الذكاء الاصطناعي لنقاط الضعف</h3>
                </div>
                
                {isAnalyzing ? (
                   <div className="flex items-center gap-2 text-indigo-600">
                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     <span>جاري تحليل إجاباتك الخاطئة...</span>
                   </div>
                ) : analysis ? (
                   <div className="space-y-4">
                      {analysis.weakPoints.length > 0 && (
                        <div>
                           <h4 className="font-bold text-indigo-800 mb-2">المواضيع التي تحتاج مراجعة:</h4>
                           <ul className="list-disc pr-5 space-y-1 text-indigo-700">
                             {analysis.weakPoints.map((point, i) => <li key={i}>{point}</li>)}
                           </ul>
                        </div>
                      )}
                      <div>
                         <h4 className="font-bold text-indigo-800 mb-2">توصيات الدراسة:</h4>
                         <p className="text-indigo-700 leading-relaxed">{analysis.recommendations}</p>
                      </div>
                   </div>
                ) : null}
             </div>
          )}

          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-800 border-b pb-2">تفاصيل الإجابات</h4>
            {questions.map((q, idx) => (
              <div key={idx} className={`p-4 rounded-2xl ${selectedAnswers[idx] === q.answer ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                <p className="font-semibold text-slate-800 mb-2">{idx + 1}. {q.question}</p>
                <div className="text-sm space-y-1">
                   <p className="flex items-center gap-2">
                     <span className="font-bold">إجابتك:</span> 
                     <span className={selectedAnswers[idx] === q.answer ? 'text-emerald-600' : 'text-red-600'}>{selectedAnswers[idx]}</span>
                   </p>
                   {selectedAnswers[idx] !== q.answer && (
                     <p className="flex items-center gap-2 text-emerald-700">
                       <span className="font-bold">الإجابة الصحيحة:</span> {q.answer}
                     </p>
                   )}
                   <p className="text-slate-500 mt-2 text-xs pt-2 border-t border-slate-200/50">
                     <span className="font-bold">الشرح:</span> {q.explanation}
                   </p>
                </div>
              </div>
            ))}
          </div>

          <Button onClick={() => {
            setShowResults(false);
            setFile(null);
            setQuestions([]);
            setSelectedAnswers({});
            setCurrentQIndex(0);
            setAnalysis(null);
          }} className="w-full">
            اختبار جديد
          </Button>
        </div>
      )}
    </div>
  );
};