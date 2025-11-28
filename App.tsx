
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, X, FileText, BarChart3, TrendingUp, Layout, FileSpreadsheet, Eye, Moon, Sun, LogOut, Settings, User as UserIcon, MessageSquareText } from 'lucide-react';
import { geminiService } from './services/geminiService';
import { supabaseService } from './services/supabaseService';
import { Message, MessageRole, WorkspaceState, WorkspaceTab, UserProfile, Theme, ChatThread } from './types';
import ChatMessage from './components/ChatMessage';
import FinancialChart from './components/FinancialChart';
import FinancialTable from './components/FinancialTable';
import LoginScreen from './components/LoginScreen';
import PDFViewerWithHighlight from './components/PDFViewerWithHighlight';
import ThreadList from './components/ThreadList';
import ExcelViewer from './components/ExcelViewer';

interface Attachment {
  name: string;
  mimeType: string;
  data: string; // base64
}

function App() {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Theme State
  const [theme, setTheme] = useState<Theme>('light');

  // Thread Management
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string>('');
  const [showThreadList, setShowThreadList] = useState(true);

  // App State
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  // Get active thread data
  const activeThread = threads.find(t => t.id === activeThreadId);
  const messages = activeThread?.messages || [];
  const workspace = activeThread?.workspace || {
    activeTab: 'document' as WorkspaceTab,
    chartData: null,
    tableData: null,
    documentName: null,
    documentData: null,
    documentMimeType: null,
    documentUrl: null
  };
  const highlightedNumbers = activeThread?.highlightedNumbers || [];
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);

  // --- Effects ---

  // Handle Dark Mode Class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial Check for stored auth/theme/threads
  useEffect(() => {
    // Load theme from localStorage
    const storedTheme = localStorage.getItem('finpartner_theme') as Theme;
    if (storedTheme) setTheme(storedTheme);
    
    // Load user from localStorage
    const storedUser = localStorage.getItem('finpartner_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        geminiService.startChat();
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('finpartner_user');
      }
    }

    // Load threads from localStorage or Supabase
    const loadThreadsAsync = async () => {
      const loadedThreads = await loadThreadsFromStorage();
      if (loadedThreads.length > 0) {
        // Recreate blob URLs for all threads with documents
        const threadsWithBlobs = loadedThreads.map(thread => {
          if (thread.workspace?.documentData && thread.workspace.documentMimeType) {
            try {
              const byteCharacters = atob(thread.workspace.documentData);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: thread.workspace.documentMimeType });
              const objectUrl = URL.createObjectURL(blob);
              
              return {
                ...thread,
                workspace: {
                  ...thread.workspace,
                  documentUrl: objectUrl
                }
              };
            } catch (error) {
              console.error('Error recreating blob for thread:', thread.id, error);
              return thread;
            }
          }
          return thread;
        });
        
        setThreads(threadsWithBlobs);
        setActiveThreadId(threadsWithBlobs[0].id);
      } else {
        // Create initial thread if none exist
        createNewThread();
      }
    };
    
    loadThreadsAsync();
  }, []);

  // Cleanup blob URLs when active thread changes
  useEffect(() => {
    return () => {
      if (workspace.documentUrl) {
        URL.revokeObjectURL(workspace.documentUrl);
      }
    };
  }, [activeThreadId]);

  // Recreate blob URL when switching threads
  useEffect(() => {
    const currentThread = threads.find(t => t.id === activeThreadId);
    
    if (!currentThread?.workspace?.documentData || !currentThread.workspace.documentMimeType) {
      return;
    }
    
    console.log('📄 Checking blob URL for thread:', activeThreadId);
    
    // Always recreate blob URL to ensure it's valid
    try {
      // Clean up old blob URL if exists
      if (currentThread.workspace.documentUrl) {
        URL.revokeObjectURL(currentThread.workspace.documentUrl);
      }
      
      // Convert base64 to blob
      const byteCharacters = atob(currentThread.workspace.documentData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: currentThread.workspace.documentMimeType });
      const objectUrl = URL.createObjectURL(blob);
      
      console.log('✅ Blob URL created for', currentThread.workspace.documentName || 'document');
      
      // Update thread with new blob URL
      setThreads(prevThreads => 
        prevThreads.map(t =>
          t.id === activeThreadId
            ? {
                ...t,
                workspace: {
                  ...t.workspace!,
                  documentUrl: objectUrl
                }
              }
            : t
        )
      );
      
      // Cleanup when switching away or unmounting
      return () => {
        console.log('🧹 Cleaning up blob URL for thread:', activeThreadId);
        URL.revokeObjectURL(objectUrl);
      };
    } catch (error) {
      console.error('❌ Error recreating blob URL:', error);
    }
  }, [activeThreadId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close settings menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        // Check if click is not on the toggle buttons
        const target = event.target as HTMLElement;
        const isToggleButton = target.closest('[data-settings-toggle]');
        if (!isToggleButton) {
          setShowSettings(false);
        }
      }
    };

    if (showSettings) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSettings]);

  // --- Handlers ---

  const handleLogin = (userProfile?: UserProfile) => {
    // Use provided user profile or create default mock user
    const loginUser: UserProfile = userProfile || {
      name: "Anh Trí",
      email: "tri.analyst@finpartner.ai",
      role: "Lead Analyst",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    };
    
    // Save user to state and localStorage
    setUser(loginUser);
    localStorage.setItem('finpartner_user', JSON.stringify(loginUser));
    
    // Initialize chat session
    geminiService.startChat();
  };

  const handleLogout = () => {
    setUser(null);
    setShowSettings(false);
    // Clear user from localStorage
    localStorage.removeItem('finpartner_user');
    // Optionally clear chat history
    geminiService.startChat(); // Reset chat session
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('finpartner_theme', newTheme);
  };

  // --- Thread Management ---
  
  const createNewThread = () => {
    const newThread: ChatThread = {
      id: Date.now().toString(),
      title: `Chat ${threads.length + 1}`,
      messages: [{
        id: '1',
        role: MessageRole.MODEL,
        text: "**FinPartner Pro đã khởi động.** 🚀\n\nChào anh Trí, em sẵn sàng phân tích tài chính!\n\n📊 **Tính năng:**\n- 🎯 **Drag & Drop** - PDF/Excel vào chat\n- 📈 **Deep Analysis** - 30+ chỉ số + insights\n- 💡 **Smart Highlights** - Auto highlight trên PDF\n- 📋 **Multi-Dashboard** - Charts, tables, Excel viewer\n- 💬 **Multi-Thread** - Lưu lịch sử\n\n**Quick Test:**\nThử gửi: *\"Tạo dashboard mẫu cho công ty tech với revenue $10M\"*\n\n**Hoặc upload file:**\n1. Kéo thả PDF/Excel vào đây\n2. Em sẽ tự động:\n   - Generate charts & tables\n   - Highlight key numbers trên PDF\n   - Phân tích sâu\n\nSẵn sàng! 📈",
        timestamp: new Date()
      }],
      createdAt: new Date(),
      updatedAt: new Date(),
      workspace: {
        activeTab: 'document',
        chartData: null,
        tableData: null,
        documentName: null,
        documentData: null,
        documentMimeType: null,
        documentUrl: null
      },
      highlightedNumbers: []
    };
    
    setThreads(prev => [newThread, ...prev]);
    setActiveThreadId(newThread.id);
    saveThreadsToStorage([newThread, ...threads]);
  };

  const selectThread = (threadId: string) => {
    console.log('🔄 Switching to thread:', threadId);
    
    // Cleanup old blob URL
    if (workspace.documentUrl) {
      URL.revokeObjectURL(workspace.documentUrl);
    }
    
    setActiveThreadId(threadId);
  };

  const deleteThread = (threadId: string) => {
    const updatedThreads = threads.filter(t => t.id !== threadId);
    setThreads(updatedThreads);
    
    if (activeThreadId === threadId) {
      setActiveThreadId(updatedThreads[0]?.id || '');
    }
    
    saveThreadsToStorage(updatedThreads);
  };

  const renameThread = (threadId: string, newTitle: string) => {
    const updatedThreads = threads.map(t =>
      t.id === threadId ? { ...t, title: newTitle, updatedAt: new Date() } : t
    );
    setThreads(updatedThreads);
    saveThreadsToStorage(updatedThreads);
  };

  const updateActiveThread = (updates: Partial<ChatThread>) => {
    const updatedThreads = threads.map(t =>
      t.id === activeThreadId
        ? { ...t, ...updates, updatedAt: new Date() }
        : t
    );
    setThreads(updatedThreads);
    saveThreadsToStorage(updatedThreads);
  };

  const saveThreadsToStorage = async (threadsToSave: ChatThread[]) => {
    try {
      // Save to localStorage (local backup)
      localStorage.setItem('finpartner_threads', JSON.stringify(threadsToSave));
      
      // Sync to Supabase cloud (if user logged in)
      if (user) {
        const latestThread = threadsToSave[0];
        if (latestThread) {
          await supabaseService.syncThreadToCloud(latestThread, user.email);
        }
      }
    } catch (e) {
      console.error('Error saving threads:', e);
    }
  };

  const loadThreadsFromStorage = async () => {
    try {
      // Try to load from Supabase first (if user logged in)
      if (user) {
        console.log('Loading threads from Supabase...');
        const cloudThreads = await supabaseService.loadThreads(user.email);
        if (cloudThreads.length > 0) {
          console.log('✅ Loaded', cloudThreads.length, 'threads from cloud');
          return cloudThreads;
        }
      }
      
      // Fallback to localStorage
      const stored = localStorage.getItem('finpartner_threads');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Convert date strings back to Date objects
        const threads = parsed.map((t: any) => ({
          ...t,
          createdAt: new Date(t.createdAt),
          updatedAt: new Date(t.updatedAt),
          messages: t.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
        console.log('✅ Loaded', threads.length, 'threads from localStorage');
        return threads;
      }
    } catch (e) {
      console.error('Error loading threads:', e);
    }
    return [];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const objectUrl = URL.createObjectURL(file);

      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const newAttachment = {
        name: file.name,
        mimeType: file.type,
        data: base64Data
      };

      setAttachment(newAttachment);
      
      // Update active thread workspace with document
      if (workspace.documentUrl) {
        URL.revokeObjectURL(workspace.documentUrl);
      }

      // Determine tab based on file type
      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || 
                     file.name.toLowerCase().endsWith('.xls');
      
      updateActiveThread({
        workspace: {
          ...workspace,
          activeTab: isExcel ? 'excel' : 'document',
          documentName: file.name,
          documentData: base64Data,
          documentMimeType: file.type,
          documentUrl: objectUrl,
          excelData: isExcel ? [] : null
        }
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
  };

  // --- Drag & Drop Handlers ---
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const file = files.find(f => {
      const lower = f.name.toLowerCase();
      return f.type === 'application/pdf' || 
             lower.endsWith('.pdf') ||
             f.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
             f.type === 'application/vnd.ms-excel' ||
             lower.endsWith('.xlsx') ||
             lower.endsWith('.xls');
    });

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      const base64Data = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(file);
      });

      const newAttachment = {
        name: file.name,
        mimeType: file.type,
        data: base64Data
      };

      setAttachment(newAttachment);
      
      if (workspace.documentUrl) {
        URL.revokeObjectURL(workspace.documentUrl);
      }

      // Determine tab based on file type
      const isExcel = file.name.toLowerCase().endsWith('.xlsx') || 
                     file.name.toLowerCase().endsWith('.xls');
      
      updateActiveThread({
        workspace: {
          ...workspace,
          activeTab: isExcel ? 'excel' : 'document',
          documentName: file.name,
          documentData: base64Data,
          documentMimeType: file.type,
          documentUrl: objectUrl,
          excelData: isExcel ? [] : null
        }
      });

      // Auto-trigger analysis
      setInput(`Phân tích sâu ${isExcel ? 'dữ liệu' : 'báo cáo'} ${file.name}`);
    } else {
      alert('Vui lòng kéo thả file PDF hoặc Excel (.xlsx, .xls)');
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isLoading || !activeThreadId) return;

    const userText = input.trim() || (attachment ? `Phân tích file ${attachment.name} và trích xuất dữ liệu quan trọng.` : "");
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: attachment ? `[File Uploaded: ${attachment.name}]\n${userText}` : userText,
      timestamp: new Date()
    };

    // Add user message to active thread
    updateActiveThread({
      messages: [...messages, userMsg]
    });
    
    const currentAttachment = attachment;
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const responseText = await geminiService.sendMessage(
        userText,
        currentAttachment ? { mimeType: currentAttachment.mimeType, data: currentAttachment.data } : null,
        (chart) => {
          console.log('📊 Chart received:', chart.title);
          // Update workspace with chart immediately
          updateActiveThread({
            workspace: { 
              ...workspace, 
              activeTab: 'chart', 
              chartData: chart 
            }
          });
        },
        (table) => {
          console.log('📋 Table received:', table.title);
          // Update workspace with table immediately
          updateActiveThread({
            workspace: { 
              ...workspace, 
              activeTab: 'table', 
              tableData: table 
            }
          });
        },
        (metrics) => {
          console.log('🎯 Metrics received:', metrics.length, 'items');
          // Update highlighted numbers and optionally switch to document tab
          updateActiveThread({
            highlightedNumbers: metrics,
            workspace: { 
              ...workspace, 
              activeTab: workspace.documentData ? 'document' : workspace.activeTab 
            }
          });
        }
      );

      if (responseText) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: MessageRole.MODEL,
          text: responseText,
          timestamp: new Date()
        };
        
        updateActiveThread({
          messages: [...messages, userMsg, aiMsg]
        });
      }

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: "**System Alert**\n\nKết nối bị gián đoạn. Vui lòng thử lại.",
        timestamp: new Date(),
        isError: true
      };
      
      updateActiveThread({
        messages: [...messages, userMsg, errorMsg]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const switchTab = (tab: WorkspaceTab) => {
    updateActiveThread({
      workspace: { ...workspace, activeTab: tab }
    });
  };

  // --- Render ---

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-slate-900 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Thread List Sidebar */}
      {showThreadList && (
        <ThreadList
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={selectThread}
          onNewThread={createNewThread}
          onDeleteThread={deleteThread}
          onRenameThread={renameThread}
        />
      )}

      {/* Settings Modal with Overlay */}
      {showSettings && (
        <>
          {/* Backdrop/Overlay */}
          <div 
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-40 transition-opacity duration-200"
            onClick={() => setShowSettings(false)}
          ></div>
          
          {/* Settings Menu */}
          <div 
            ref={settingsRef}
            className="absolute top-16 left-4 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 animate-in slide-in-from-top-2 duration-200"
          >
             <div className="flex items-center gap-3 mb-4">
                <img src={user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-600" />
                <div>
                   <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                   <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
             </div>
             
             <div className="space-y-1">
               <button onClick={toggleTheme} className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
                  <span className="flex items-center gap-2">
                    {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === 'light' ? 'Light Mode' : 'Dark Mode'}
                  </span>
                  <span className="text-xs text-slate-400">Switch</span>
               </button>
               <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
               <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors">
                  <LogOut size={16} /> Sign Out
               </button>
             </div>
          </div>
        </>
      )}

      {/* LEFT PANEL: Chat Interface (35% - 40%) */}
      <div className="flex flex-col w-[400px] xl:w-[450px] border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-full shadow-lg z-10 transition-colors">
        
        {/* Header */}
        <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 justify-between transition-colors">
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => setShowSettings(!showSettings)}
            data-settings-toggle
          >
            <div className="h-8 w-8 rounded bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white shadow-md">
                <BarChart3 size={18} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">FINPARTNER <span className="text-slate-400 font-normal">PRO</span></h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Analyst: {user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button
                onClick={() => setShowThreadList(!showThreadList)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title={showThreadList ? 'Hide chats' : 'Show chats'}
             >
                <MessageSquareText size={16} className="text-slate-600 dark:text-slate-400" />
             </button>
             <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                <TrendingUp size={10} /> Online
             </div>
             <button 
                onClick={() => setShowSettings(!showSettings)}
                data-settings-toggle
                className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 ring-slate-200 dark:ring-slate-700 transition-all"
             >
                <img src={user.avatarUrl} alt="User" />
             </button>
          </div>
        </div>

        {/* Messages with Drag & Drop Zone */}
        <div 
          ref={dropZoneRef}
          className="flex-1 overflow-y-auto px-4 py-6 bg-white dark:bg-slate-900 scroll-smooth transition-colors relative"
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag & Drop Overlay */}
          {isDragging && (
            <div className="absolute inset-0 bg-blue-500/10 dark:bg-blue-500/20 backdrop-blur-sm z-50 flex items-center justify-center border-4 border-dashed border-blue-500 dark:border-blue-400 rounded-lg m-2">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                  <FileText size={40} className="text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-300 mb-2">
                  Thả file vào đây
                </p>
                <p className="text-sm text-blue-600 dark:text-blue-400">
                  Hỗ trợ: PDF (10Q/10K, Financial Statements) & Excel (.xlsx, .xls)
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <ChatMessage 
                key={msg.id} 
                message={msg} 
                onViewData={() => {
                    if (msg.relatedChart) {
                        switchTab('chart');
                    } else if (msg.relatedTable) {
                        switchTab('table');
                    }
                }}
            />
          ))}
          {isLoading && (
            <div className="flex items-center gap-3 text-slate-400 dark:text-slate-500 text-sm p-4 animate-pulse">
              <Loader2 className="animate-spin" size={16} />
              <span className="font-medium">Processing Financial Data...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 transition-colors">
           {attachment && (
            <div className="mb-2 flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-fit px-2 py-1.5 rounded text-xs transition-colors">
                <FileText size={12} className="text-slate-500 dark:text-slate-400"/>
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{attachment.name}</span>
                <button onClick={clearAttachment} className="ml-1 text-slate-400 hover:text-red-500 dark:hover:text-red-400"><X size={12}/></button>
            </div>
          )}
          <div className="relative">
             <textarea 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask FinPartner..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-slate-400 dark:focus:border-slate-500 text-slate-800 dark:text-white text-sm rounded-lg py-3 px-4 pr-10 focus:outline-none resize-none h-[50px] shadow-sm transition-colors"
             />
             <div className="absolute right-2 bottom-2 flex items-center gap-1">
                 <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
                 >
                    <Paperclip size={16} />
                 </button>
                 <button 
                    onClick={handleSendMessage}
                    disabled={!input.trim() && !attachment}
                    className="p-1.5 bg-slate-900 dark:bg-blue-600 text-white rounded hover:bg-slate-700 dark:hover:bg-blue-700 disabled:opacity-50 transition-colors"
                 >
                    <Send size={14} />
                 </button>
             </div>
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,application/pdf,image/*,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel" />
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Workspace (60% - 65%) */}
      <div className="flex-1 flex flex-col h-full bg-[#f1f5f9] dark:bg-slate-950 relative transition-colors">
        
        {/* Workspace Toolbar */}
        <div className="h-12 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center px-4 justify-between shrink-0 transition-colors">
            <div className="flex gap-1">
                <button 
                    onClick={() => switchTab('chart')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all
                        ${workspace.activeTab === 'chart' 
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <BarChart3 size={14} /> Visualization
                </button>
                <button 
                    onClick={() => switchTab('table')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all
                        ${workspace.activeTab === 'table' 
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <FileSpreadsheet size={14} /> Data Grid
                </button>
                <button 
                    onClick={() => switchTab('document')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all
                        ${workspace.activeTab === 'document' 
                        ? 'bg-slate-800 dark:bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <Eye size={14} /> Source Document
                </button>
                <button 
                    onClick={() => switchTab('excel')}
                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all
                        ${workspace.activeTab === 'excel' 
                        ? 'bg-green-600 dark:bg-green-600 text-white shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                    <FileSpreadsheet size={14} className="text-green-600" /> Excel
                </button>
            </div>
            <div className="text-[10px] text-slate-400 font-mono hidden md:block">
                WS-ID: {Date.now().toString().slice(-6)}
            </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden p-6 flex justify-center items-center">
            
            {/* Chart View */}
            {workspace.activeTab === 'chart' && (
                workspace.chartData ? (
                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <FinancialChart config={workspace.chartData} />
                    </div>
                ) : (
                    <div className="text-center text-slate-400 dark:text-slate-600">
                        <BarChart3 size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No chart generated yet.</p>
                        <p className="text-xs mt-1 opacity-70">Ask FinPartner to visualize data.</p>
                    </div>
                )
            )}

            {/* Table View */}
            {workspace.activeTab === 'table' && (
                workspace.tableData ? (
                    <div className="w-full h-full bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        <FinancialTable config={workspace.tableData} />
                    </div>
                ) : (
                     <div className="text-center text-slate-400 dark:text-slate-600">
                        <FileSpreadsheet size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No structured data extracted.</p>
                    </div>
                )
            )}

            {/* Document View */}
            {workspace.activeTab === 'document' && (
                <div className="w-full h-full rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <PDFViewerWithHighlight
                        documentName={workspace.documentName}
                        documentUrl={workspace.documentUrl}
                        documentData={workspace.documentData}
                        documentMimeType={workspace.documentMimeType}
                        highlightedNumbers={highlightedNumbers}
                    />
                </div>
            )}

            {/* Excel View */}
            {workspace.activeTab === 'excel' && (
                <div className="w-full h-full rounded-xl shadow-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                    <ExcelViewer
                        documentName={workspace.documentName}
                        documentData={workspace.documentData}
                        onDataExtracted={(data) => {
                          console.log('Excel data extracted:', data);
                          // You can store this data for AI analysis
                        }}
                    />
                </div>
            )}

        </div>
      </div>
    </div>
  );
}

export default App;
