import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function CustomModal({ title, message, confirmText, cancelText, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-[#11151E] border border-[#1E2533] p-6 rounded-2xl max-w-sm w-full text-center space-y-5 shadow-2xl shadow-black/40">
        <div className="w-12 h-12 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
        </div>
        <h3 className="text-lg font-bold text-[#F5F7FA]">{title || 'WatchMatch'}</h3>
        <p className="text-sm text-[#9CA3AF] leading-relaxed">{message}</p>
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl bg-[#181D28] hover:bg-[#1E2533] border border-[#1E2533] text-[#9CA3AF] font-semibold text-sm transition cursor-pointer"
            >
              {cancelText || 'İptal'}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl bg-[#bd3191] hover:bg-[#7d0d5a] text-white font-bold text-sm transition cursor-pointer"
          >
            {confirmText || 'Tamam'}
          </button>
        </div>
      </div>
    </div>
  );
}
