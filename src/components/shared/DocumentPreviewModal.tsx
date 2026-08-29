"use client";

import { X } from "lucide-react";

export function DocumentPreviewModal({ url, title, onClose }: { url: string, title: string, onClose: () => void }) {
  let finalUrl = url;
  if (url.includes('drive.google.com/drive/folders/')) {
    const match = url.match(/\/folders\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
      finalUrl = `https://drive.google.com/embeddedfolderview?id=${match[1]}#list`;
    }
  } else if (url.includes('drive.google.com')) {
    finalUrl = url.replace('/view', '/preview');
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 md:p-8" onClick={onClose}>
      <div className="w-full max-w-4xl h-full max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-slate-50 shrink-0">
          <div><h2 className="text-lg font-bold text-slate-800">{title}</h2></div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-200 transition-colors"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex-1 bg-slate-100 p-2 md:p-4 overflow-hidden relative">
          <iframe
            src={finalUrl}
            className="w-full h-full rounded shadow-sm border-0 bg-white"
            title="Document Preview"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  )
}
