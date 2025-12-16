import React from 'react';
import { Button } from './Button';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  onDownload: () => void;
  downloadLabel?: string;
}

export const ResultModal: React.FC<ResultModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  title,
  onDownload,
  downloadLabel = "طباعة / حفظ PDF"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/95 backdrop-blur-sm print:bg-white print:overflow-visible print:inset-auto print:static">
      <div className="min-h-screen flex flex-col print:block">
        
        {/* Toolbar - Hidden when printing */}
        <div className="sticky top-0 z-10 bg-white/10 border-b border-white/10 p-4 backdrop-blur-md no-print">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
             <div className="text-white font-bold text-lg">{title}</div>
             <div className="flex gap-3">
                <Button variant="danger" onClick={onClose} className="px-4 py-2 text-sm bg-white/10 hover:bg-white/20 border-0">
                   إغلاق
                </Button>
                <Button onClick={onDownload} className="px-4 py-2 text-sm">
                   {downloadLabel}
                </Button>
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-8 print:p-0">
           {children}
        </div>
      </div>
    </div>
  );
};