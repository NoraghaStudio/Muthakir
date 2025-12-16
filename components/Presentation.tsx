import React, { useState } from 'react';
import { Button } from './Button';
import { FileUpload } from './FileUpload';
import { ResultModal } from './ResultModal';
import { generatePresentation, fileToBase64 } from '../services/geminiService';
import { Slide, PresentationStyle, PresentationDetailLevel } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const Presentation: React.FC = () => {
  const [inputType, setInputType] = useState<'topic' | 'file'>('topic');
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  
  const [style, setStyle] = useState<PresentationStyle>(PresentationStyle.MODERN_BLUE);
  const [slideCount, setSlideCount] = useState<number>(8);
  const [detailLevel, setDetailLevel] = useState<PresentationDetailLevel>(PresentationDetailLevel.STANDARD);
  const [withImages, setWithImages] = useState(true);
  
  const [isLoading, setIsLoading] = useState(false);
  const [slides, setSlides] = useState<Slide[]>([]);

  const handleGenerate = async () => {
    if (inputType === 'topic' && !topic.trim()) return;
    if (inputType === 'file' && !file) return;

    setIsLoading(true);
    try {
      let inputData = topic;
      let isFile = false;

      if (inputType === 'file' && file) {
        inputData = await fileToBase64(file);
        isFile = true;
      }

      const result = await generatePresentation(
        inputData, 
        isFile, 
        withImages, 
        slideCount, 
        detailLevel
      );
      setSlides(result);
    } catch (error) {
      alert("حدث خطأ أثناء إنشاء العرض. تأكد من الملف وحاول مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    // Inject print styles for Landscape
    const style = document.createElement('style');
    style.innerHTML = `
      @page { size: landscape; margin: 0; }
    `;
    style.id = 'print-orientation';
    document.head.appendChild(style);
    
    window.print();
    
    document.head.removeChild(style);
  };

  const styleLabels: Record<PresentationStyle, string> = {
    [PresentationStyle.MODERN_BLUE]: 'أزرق عصري (Modern Blue)',
    [PresentationStyle.MINIMALIST_DARK]: 'ليلي بسيط (Dark Mode)',
    [PresentationStyle.NATURE_FRESH]: 'طبيعة منعشة (Nature)',
    [PresentationStyle.GEOMETRIC_PURPLE]: 'هندسي بنفسجي (Geometric)',
    [PresentationStyle.ELEGANT_GOLD]: 'ذهبي فاخر (Elegant)',
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  // Helper to render chart based on data
  const renderChart = (slide: Slide) => {
    if (!slide.chart) return null;

    const { type, data, title } = slide.chart;

    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-white/50 rounded-xl p-4 shadow-sm border border-slate-100">
        <h4 className="text-lg font-bold mb-4 text-slate-700">{title}</h4>
        <div className="w-full h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            {type === 'bar' ? (
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#6366f1" name="القيمة" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="text-center mb-8 no-print">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">صانع العروض التقديمية</h2>
        <p className="text-slate-500">أنشئ عروضاً تقديمية احترافية من موضوع أو ملف</p>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 space-y-6 max-w-3xl mx-auto">
        
        {/* Input Type Selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-4">
          <button 
            onClick={() => setInputType('topic')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${inputType === 'topic' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            كتابة موضوع
          </button>
          <button 
            onClick={() => setInputType('file')}
            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${inputType === 'file' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            رفع ملف
          </button>
        </div>

        {inputType === 'topic' ? (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">موضوع العرض</label>
            <input 
              type="text" 
              className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-lg"
              placeholder="مثال: الذكاء الاصطناعي في الطب"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
        ) : (
          <FileUpload onFileSelect={setFile} label="ارفع ملف العرض (PDF)" />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
           <div className="space-y-2">
             <label className="block text-sm font-medium text-slate-700">نمط التصميم</label>
             <select 
               className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none"
               value={style}
               onChange={(e) => setStyle(e.target.value as PresentationStyle)}
             >
               {Object.values(PresentationStyle).map((s) => (
                 <option key={s} value={s}>{styleLabels[s] || s}</option>
               ))}
             </select>
           </div>
           
           <div className="space-y-2">
             <label className="block text-sm font-medium text-slate-700">مستوى التفاصيل</label>
             <select 
               className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 outline-none"
               value={detailLevel}
               onChange={(e) => setDetailLevel(e.target.value as PresentationDetailLevel)}
             >
               {Object.values(PresentationDetailLevel).map((l) => (
                 <option key={l} value={l}>{l}</option>
               ))}
             </select>
           </div>

           <div className="space-y-2">
             <label className="block text-sm font-medium text-slate-700">عدد الشرائح التقريبي: <span className="text-indigo-600 font-bold">{slideCount}</span></label>
             <input 
               type="range" 
               min="3" 
               max="20" 
               value={slideCount}
               onChange={(e) => setSlideCount(Number(e.target.value))}
               className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
             />
             <div className="flex justify-between text-xs text-slate-400">
               <span>3</span>
               <span>20</span>
             </div>
           </div>

           <div className="space-y-2 flex items-center pt-6">
             <label className="flex items-center gap-2 cursor-pointer">
               <input 
                 type="checkbox" 
                 checked={withImages}
                 onChange={(e) => setWithImages(e.target.checked)}
                 className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
               />
               <span className="text-sm font-medium text-slate-700">تضمين صور ورسوم بيانية</span>
             </label>
           </div>
        </div>

        <Button 
          onClick={handleGenerate} 
          isLoading={isLoading} 
          disabled={(inputType === 'topic' && !topic.trim()) || (inputType === 'file' && !file)}
          className="w-full py-4 text-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
        >
          {isLoading ? 'جاري تحليل البيانات وإنشاء الشرائح...' : 'إنشاء العرض (Presentation)'}
        </Button>
      </div>

      <ResultModal 
        isOpen={slides.length > 0} 
        onClose={() => setSlides([])} 
        title="معاينة العرض التقديمي"
        onDownload={handlePrint}
        downloadLabel="تحميل العرض (PDF)"
      >
         <div className="max-w-[277mm] mx-auto space-y-0">
           {slides.map((slide, index) => (
             <div 
               key={index} 
               className={`presentation-slide p-16 relative flex flex-col justify-between theme-${style.replace(/\s+/g, '-')}`}
               style={{ width: '100%', height: '190mm' }} 
             >
                {/* Visual Elements: Top Bar */}
                <div className="slide-accent absolute top-0 left-0 right-0 h-3 opacity-90"></div>

                {/* Header */}
                <div className="relative z-10 mb-6 flex justify-between items-start">
                   <h2 className="text-4xl font-extrabold border-r-8 pr-6 leading-tight max-w-3xl tracking-tight">
                     {slide.title}
                   </h2>
                   <div className="text-6xl font-black opacity-10 font-sans">{String(index + 1).padStart(2, '0')}</div>
                </div>

                {/* Content Body */}
                <div className="relative z-10 flex-1 flex gap-10 items-start overflow-hidden">
                   {/* Text Column */}
                   <div className={`${(slide.imageBase64 || slide.chart) ? 'w-1/2' : 'w-full'} pr-6 pl-4 flex flex-col justify-center h-full`}>
                      <ul className="space-y-6">
                        {slide.content.map((point, i) => (
                          <li key={i} className="flex items-start gap-4 text-2xl leading-relaxed font-semibold">
                            <span className="bullet w-3 h-3 rounded-full mt-3 flex-shrink-0"></span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                   </div>

                   {/* Visual Column (Image OR Chart) */}
                   {withImages && (
                     <div className="w-1/2 h-full flex items-center justify-center">
                        {slide.chart ? (
                          renderChart(slide)
                        ) : slide.imageBase64 ? (
                          <div className="w-full h-full max-h-[350px] overflow-hidden rounded-2xl shadow-xl bg-white p-2">
                            <img 
                              src={slide.imageBase64} 
                              alt={slide.title} 
                              className="w-full h-full object-cover rounded-xl"
                            />
                          </div>
                        ) : null}
                     </div>
                   )}
                </div>
             </div>
           ))}
         </div>
      </ResultModal>
    </div>
  );
};