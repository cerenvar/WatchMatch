import React from 'react';

export default function CustomModal({ title, message, confirmText, cancelText, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/85 backdrop-blur-md px-4 animate-fade-in">
      <div className="bg-gray-900 border border-gray-850 p-6 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-2xl shadow-purple-500/5 transform scale-100 transition-all border-sky-500/20">
        <div className="text-4xl animate-pulse">🍿</div>
        <h3 className="text-base font-extrabold text-white tracking-tight">{title || 'WatchMatch'}</h3>
        <p className="text-xs text-gray-400 leading-relaxed font-medium">{message}</p>
        <div className="flex gap-2.5 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl bg-gray-950 hover:bg-gray-800 border border-gray-850 text-gray-400 font-bold text-xs transition cursor-pointer"
            >
              {cancelText || 'İptal'}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-purple-500 to-pink-500 hover:from-sky-600 hover:via-purple-600 hover:to-pink-600 text-white font-black text-xs transition cursor-pointer shadow-lg shadow-purple-500/10"
          >
            {confirmText || 'Tamam'}
          </button>
        </div>
      </div>
    </div>
  );
}
