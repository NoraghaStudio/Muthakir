import React, { useState } from 'react';
import { AppMode } from './types';
import { Summarizer } from './components/Summarizer';
import { Flashcards } from './components/Flashcards';
import { Researcher } from './components/Researcher';
import { Presentation } from './components/Presentation';
import { Quizzer } from './components/Quizzer';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.HOME);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (mode) {
      case AppMode.SUMMARIZER: return <Summarizer />;
      case AppMode.FLASHCARDS: return <Flashcards />;
      case AppMode.RESEARCH: return <Researcher />;
      case AppMode.PRESENTATION: return <Presentation />;
      case AppMode.QUIZ: return <Quizzer />;
      default: return <Home onNavigate={setMode} />;
    }
  };

  const navItems = [
    { id: AppMode.HOME, label: 'الرئيسية', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
    { id: AppMode.SUMMARIZER, label: 'التلخيص الذكي', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg> },
    { id: AppMode.FLASHCARDS, label: 'فلاش كاردز', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg> },
    { id: AppMode.RESEARCH, label: 'الباحث الأكاديمي', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg> },
    { id: AppMode.PRESENTATION, label: 'عروض تقديمية', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg> },
    { id: AppMode.QUIZ, label: 'اختبارات', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 right-0 z-50 w-72 bg-white border-l border-slate-200 shadow-xl lg:shadow-none transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="bg-indigo-600 rounded-xl p-2 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">مُذاكِر</h1>
          </div>

          <nav className="space-y-2 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setMode(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group
                  ${mode === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-bold shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                  }`}
              >
                <div className={`transition-colors duration-200 ${mode === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                  {item.icon}
                </div>
                {item.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
             <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-2xl p-4 text-white">
                <p className="font-bold mb-1">نسخة تجريبية</p>
                <p className="text-xs text-indigo-100 opacity-80">مدعوم بواسطة Google Gemini</p>
             </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white sticky top-0 z-30 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg text-slate-600 hover:bg-slate-50">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-lg text-slate-800">مُذاكِر</span>
          <div className="w-10"></div> {/* Spacer */}
        </div>

        <div className="p-6 lg:p-10 max-w-7xl mx-auto min-h-full">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Home/Welcome Component
const Home: React.FC<{ onNavigate: (mode: AppMode) => void }> = ({ onNavigate }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-10 animate-fade-in-up">
    <div className="space-y-4 max-w-2xl">
      <span className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-sm font-bold tracking-wide mb-2">
        رفيقك الدراسي الأذكى
      </span>
      <h2 className="text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight">
        حول دراستك إلى <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">
          متعة وإنجاز
        </span>
      </h2>
      <p className="text-xl text-slate-500 leading-relaxed max-w-lg mx-auto">
        منصة متكاملة تساعدك على التلخيص، المراجعة، البحث، واختبار معلوماتك بضغطة زر واحدة.
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-5xl">
      <div 
        onClick={() => onNavigate(AppMode.SUMMARIZER)}
        className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all cursor-pointer text-right"
      >
        <div className="h-12 w-12 bg-indigo-100 rounded-2xl flex items-center justify-center text-indigo-600 mb-4 group-hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">تلخيص المحاضرات</h3>
        <p className="text-slate-500 text-sm">حول الملفات الطويلة إلى ملخصات مركزة.</p>
      </div>

      <div 
        onClick={() => onNavigate(AppMode.FLASHCARDS)}
        className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all cursor-pointer text-right"
      >
        <div className="h-12 w-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">فلاش كاردز</h3>
        <p className="text-slate-500 text-sm">راجع المعلومات بسرعة وكفاءة.</p>
      </div>

       <div 
        onClick={() => onNavigate(AppMode.RESEARCH)}
        className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer text-right"
      >
        <div className="h-12 w-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">البحث العلمي</h3>
        <p className="text-slate-500 text-sm">كتابة أبحاث بمصادر حقيقية.</p>
      </div>

      <div 
        onClick={() => onNavigate(AppMode.PRESENTATION)}
        className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all cursor-pointer text-right"
      >
        <div className="h-12 w-12 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 group-hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">عروض تقديمية</h3>
        <p className="text-slate-500 text-sm">اصنع شرائح احترافية في ثوانٍ.</p>
      </div>

      <div 
        onClick={() => onNavigate(AppMode.QUIZ)}
        className="group p-6 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer text-right"
      >
        <div className="h-12 w-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-4 group-hover:scale-110 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">اختبارات ذاتية</h3>
        <p className="text-slate-500 text-sm">قيم مستواك واعرف نقاط ضعفك.</p>
      </div>
    </div>
  </div>
);

export default App;