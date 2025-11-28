import React, { useState } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, Search } from 'lucide-react';
import { ChatThread } from '../types';

interface ThreadListProps {
  threads: ChatThread[];
  activeThreadId: string;
  onSelectThread: (threadId: string) => void;
  onNewThread: () => void;
  onDeleteThread: (threadId: string) => void;
  onRenameThread: (threadId: string, newTitle: string) => void;
}

const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onNewThread,
  onDeleteThread,
  onRenameThread
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartEdit = (thread: ChatThread) => {
    setEditingId(thread.id);
    setEditTitle(thread.title);
  };

  const handleSaveEdit = (threadId: string) => {
    if (editTitle.trim()) {
      onRenameThread(threadId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const filteredThreads = threads.filter(thread =>
    thread.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={onNewThread}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search */}
      <div className="p-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Thread List */}
      <div className="flex-1 overflow-y-auto px-2">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            {searchQuery ? 'No chats found' : 'No chats yet'}
          </div>
        ) : (
          <div className="space-y-1">
            {filteredThreads.map((thread) => (
              <div
                key={thread.id}
                className={`group relative rounded-lg transition-all ${
                  activeThreadId === thread.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-600'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                {editingId === thread.id ? (
                  <div className="p-2 flex items-center gap-1">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit(thread.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      className="flex-1 px-2 py-1 text-sm border border-blue-500 rounded focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveEdit(thread.id)}
                      className="p-1 text-green-600 hover:bg-green-50 rounded"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => onSelectThread(thread.id)}
                    className="w-full p-3 text-left"
                  >
                    <div className="flex items-start gap-2">
                      <MessageSquare 
                        size={16} 
                        className={`mt-0.5 shrink-0 ${
                          activeThreadId === thread.id 
                            ? 'text-blue-600' 
                            : 'text-slate-400'
                        }`} 
                      />
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium truncate ${
                          activeThreadId === thread.id
                            ? 'text-blue-700 dark:text-blue-400'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {thread.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {thread.messages.length} messages • {formatDate(thread.updatedAt)}
                        </div>
                      </div>
                    </div>
                  </button>
                )}

                {/* Action buttons */}
                {editingId !== thread.id && (
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(thread);
                      }}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                      title="Rename"
                    >
                      <Edit2 size={12} className="text-slate-600 dark:text-slate-400" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this chat?')) {
                          onDeleteThread(thread.id);
                        }
                      }}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                      title="Delete"
                    >
                      <Trash2 size={12} className="text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 text-center">
        {threads.length} chat{threads.length !== 1 ? 's' : ''} total
      </div>
    </div>
  );
};

export default ThreadList;

