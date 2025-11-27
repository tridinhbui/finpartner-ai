
import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Paperclip, X, FileText, BarChart3, TrendingUp, Layout, FileSpreadsheet, Eye, Moon, Sun, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { geminiService } from './services/geminiService';
import { Message, MessageRole, WorkspaceState, WorkspaceTab, UserProfile, Theme } from './types';
import ChatMessage from './components/ChatMessage';
import FinancialChart from './components/FinancialChart';
import FinancialTable from './components/FinancialTable';
import LoginScreen from './components/LoginScreen';

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

  // App State
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Split Screen State
  const [workspace, setWorkspace] = useState<WorkspaceState>({
    activeTab: 'document',
    chartData: null,
    tableData: null,
    documentName: null,
    documentData: null,
    documentMimeType: null,
    documentUrl: null
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: MessageRole.MODEL,
      text: "**FinPartner Pro đã khởi động.**\n\nChào anh Trí, hệ thống phân tích song song (Dual-Screen) đã sẵn sàng.\n\nBên trái là kênh trao đổi nghiệp vụ, bên phải là **Workspace** để hiển thị dữ liệu gốc và biểu đồ. Anh có thể upload BCTC, file CSV hoặc yêu cầu em chạy forecast ngay bây giờ.",
      timestamp: new Date()
    }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Effects ---

  // Handle Dark Mode Class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Initial Check for stored auth/theme (Simulated)
  useEffect(() => {
    const storedTheme = localStorage.getItem('finpartner_theme') as Theme;
    if (storedTheme) setTheme(storedTheme);
    
    // Cleanup blob URLs to avoid memory leaks
    return () => {
        if (workspace.documentUrl) {
            URL.revokeObjectURL(workspace.documentUrl);
        }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- Handlers ---

  const handleLogin = () => {
    // Simulated Google Login
    const mockUser: UserProfile = {
      name: "Anh Trí",
      email: "tri.analyst@finpartner.ai",
      role: "Lead Analyst",
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    };
    setUser(mockUser);
    geminiService.startChat();
  };

  const handleLogout = () => {
    setUser(null);
    setShowSettings(false);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('finpartner_theme', newTheme);
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
      
      setWorkspace(prev => {
          if (prev.documentUrl) URL.revokeObjectURL(prev.documentUrl);
          return {
            ...prev,
            activeTab: 'document',
            documentName: file.name,
            documentData: base64Data,
            documentMimeType: file.type,
            documentUrl: objectUrl
          };
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !attachment) || isLoading) return;

    const userText = input.trim() || (attachment ? `Phân tích file ${attachment.name} và trích xuất dữ liệu quan trọng.` : "");
    
    const userMsg: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: attachment ? `[File Uploaded: ${attachment.name}]\n${userText}` : userText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    
    const currentAttachment = attachment;
    setInput('');
    setAttachment(null);
    setIsLoading(true);

    try {
      const responseText = await geminiService.sendMessage(
        userText,
        currentAttachment ? { mimeType: currentAttachment.mimeType, data: currentAttachment.data } : null,
        (chart) => {
          setWorkspace(prev => ({ ...prev, activeTab: 'chart', chartData: chart }));
          setMessages(prev => {
             const lastMsg = prev[prev.length - 1];
             if (lastMsg && lastMsg.role === MessageRole.MODEL) {
                 lastMsg.relatedChart = chart;
                 return [...prev];
             }
             return prev;
          });
        },
        (table) => {
          setWorkspace(prev => ({ ...prev, activeTab: 'table', tableData: table }));
           setMessages(prev => {
             const lastMsg = prev[prev.length - 1];
             if (lastMsg && lastMsg.role === MessageRole.MODEL) {
                 lastMsg.relatedTable = table;
                 return [...prev]; 
             }
             return prev;
          });
        }
      );

      if (responseText) {
        setMessages(prev => {
            const lastMsg = prev[prev.length - 1];
            if (lastMsg.role === MessageRole.MODEL && !lastMsg.text) {
                lastMsg.text = responseText;
                return [...prev];
            } else {
                return [...prev, {
                    id: (Date.now() + 1).toString(),
                    role: MessageRole.MODEL,
                    text: responseText,
                    timestamp: new Date()
                }];
            }
        });
      }

    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: "**System Alert**\n\nKết nối bị gián đoạn. Vui lòng thử lại.",
        timestamp: new Date(),
        isError: true
      }]);
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
    setWorkspace(prev => ({ ...prev, activeTab: tab }));
  };

  // --- Render ---

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] dark:bg-slate-900 overflow-hidden font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Settings Modal (Simplified as absolute positioned for demo) */}
      {showSettings && (
        <div className="absolute top-16 left-4 z-50 w-72 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-4 animate-in slide-in-from-top-2 duration-200">
           <div className="flex items-center gap-3 mb-4">
              <img src={user.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-slate-100 dark:border-slate-600" />
              <div>
                 <p className="font-bold text-slate-800 dark:text-white">{user.name}</p>
                 <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
              </div>
           </div>
           
           <div className="space-y-1">
             <button onClick={toggleTheme} className="w-full flex items-center justify-between p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 transition-colors">
                <span className="flex items-center gap-2"><Layout size={16} /> Theme</span>
                {theme === 'light' ? <Sun size={16} /> : <Moon size={16} />}
             </button>
             <div className="h-px bg-slate-100 dark:bg-slate-700 my-2"></div>
             <button onClick={handleLogout} className="w-full flex items-center gap-2 p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm transition-colors">
                <LogOut size={16} /> Sign Out
             </button>
           </div>
        </div>
      )}

      {/* LEFT PANEL: Chat Interface (35% - 40%) */}
      <div className="flex flex-col w-[400px] xl:w-[450px] border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 h-full shadow-lg z-10 transition-colors">
        
        {/* Header */}
        <div className="h-16 border-b border-slate-100 dark:border-slate-800 flex items-center px-4 bg-white dark:bg-slate-900 shrink-0 justify-between transition-colors">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setShowSettings(!showSettings)}>
            <div className="h-8 w-8 rounded bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white shadow-md">
                <BarChart3 size={18} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white text-sm tracking-tight">FINPARTNER <span className="text-slate-400 font-normal">PRO</span></h1>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">Analyst: {user.name}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase rounded border border-emerald-100 dark:border-emerald-800 flex items-center gap-1">
                <TrendingUp size={10} /> Online
             </div>
             <button 
                onClick={() => setShowSettings(!showSettings)}
                className="h-8 w-8 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 ring-slate-200 dark:ring-slate-700 transition-all"
             >
                <img src={user.avatarUrl} alt="User" />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-white dark:bg-slate-900 scroll-smooth transition-colors">
          {messages.map((msg) => (
            <ChatMessage 
                key={msg.id} 
                message={msg} 
                onViewData={() => {
                    if (msg.relatedChart) {
                        setWorkspace(prev => ({...prev, activeTab: 'chart', chartData: msg.relatedChart! }));
                    } else if (msg.relatedTable) {
                        setWorkspace(prev => ({...prev, activeTab: 'table', tableData: msg.relatedTable! }));
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
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept=".pdf,application/pdf,image/*" />
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
                workspace.documentData ? (
                    <div className="w-full h-full bg-slate-800 rounded-xl shadow-md overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                        <div className="h-10 bg-slate-900 flex items-center px-4 text-slate-300 text-xs border-b border-slate-700 justify-between shrink-0">
                             <span className="flex items-center gap-2"><FileText size={12}/> {workspace.documentName}</span>
                             <span className="bg-slate-700 px-2 py-0.5 rounded text-[10px]">READ-ONLY VIEW</span>
                        </div>
                        <div className="flex-1 relative bg-slate-200 w-full h-full">
                            {workspace.documentMimeType === 'application/pdf' ? (
                                <iframe 
                                    src={workspace.documentUrl || `data:application/pdf;base64,${workspace.documentData}`}
                                    className="w-full h-full"
                                    title="PDF Preview"
                                />
                            ) : workspace.documentMimeType?.includes('image') ? (
                                <div className="w-full h-full flex items-center justify-center overflow-auto bg-slate-900">
                                    <img 
                                        src={workspace.documentUrl || `data:${workspace.documentMimeType};base64,${workspace.documentData}`} 
                                        className="max-w-full max-h-full object-contain" 
                                        alt="Preview" 
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500">
                                    <p>Preview not available for this file type.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-slate-400 dark:text-slate-600">
                        <Layout size={48} className="mx-auto mb-3 opacity-20" />
                        <p className="text-sm">Workspace Empty</p>
                        <p className="text-xs mt-1 opacity-70">Upload a financial document to begin.</p>
                    </div>
                )
            )}

        </div>
      </div>
    </div>
  );
}

export default App;
