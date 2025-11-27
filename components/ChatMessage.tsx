
import React from 'react';
import { Message, MessageRole } from '../types';
import { Sparkles, User, AlertTriangle, ArrowRightCircle } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  onViewData?: () => void; // Callback to switch to workspace view
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onViewData }) => {
  const isUser = message.role === MessageRole.USER;

  // Render text with specific formatting
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, i) => {
        // Headers
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
            return <h3 key={i} className="text-slate-800 dark:text-slate-100 font-bold text-[15px] mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
        }
        // Bold segments
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <p key={i} className={`mb-2 leading-relaxed ${line.trim() === '' ? 'h-2' : ''} text-slate-700 dark:text-slate-300`}>
                {parts.map((part, index) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={index} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </p>
        );
    });
  };

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'} animate-in fade-in duration-300`}>
      <div className={`flex w-full md:max-w-[90%] ${isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 h-8 w-8 rounded flex items-center justify-center border
          ${isUser 
            ? 'bg-slate-800 border-slate-700 text-white dark:bg-slate-700 dark:border-slate-600' 
            : 'bg-white border-slate-200 text-blue-600 shadow-sm dark:bg-slate-800 dark:border-slate-700 dark:text-blue-400'}`}>
          {isUser ? <User size={14} /> : <Sparkles size={14} />}
        </div>

        {/* Content */}
        <div className={`flex flex-col gap-2 max-w-full ${isUser ? 'items-end' : 'items-start'}`}>
          
          <div className={`px-5 py-4 text-[14px] rounded-lg shadow-sm border
            ${isUser 
              ? 'bg-slate-800 border-slate-700 text-slate-50 rounded-tr-none dark:bg-slate-700 dark:border-slate-600' 
              : 'bg-white border-slate-200 text-slate-700 rounded-tl-none dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'}
            ${message.isError ? 'border-red-200 bg-red-50 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-300' : ''}
          `}>
            {message.isError && (
              <div className="flex items-center gap-2 mb-2 font-bold text-red-700 dark:text-red-400">
                <AlertTriangle size={14} /> <span>System Alert</span>
              </div>
            )}
            {/* Override renderFormattedText styles for User specifically if needed, but handled by conditional classes above mostly */}
            {isUser ? <div className="text-slate-50 dark:text-slate-100 whitespace-pre-wrap">{message.text.replace('[File Uploaded:', '').split('\n')[0]} {message.text.includes('\n') && <div className="mt-1 opacity-90">{message.text.split('\n').slice(1).join('\n')}</div>}</div> : renderFormattedText(message.text)}
          </div>

          {/* Action Link if message has associated data */}
          {(message.relatedChart || message.relatedTable) && !isUser && (
             <button 
                onClick={onViewData}
                className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-full border border-blue-100 dark:border-blue-800 w-fit"
             >
                <ArrowRightCircle size={14} />
                Xem dữ liệu chi tiết ở màn hình bên
             </button>
          )}

        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
