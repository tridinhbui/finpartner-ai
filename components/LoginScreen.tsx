
import React, { useState } from 'react';
import { BarChart3, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    // Simulate API delay
    setTimeout(() => {
      onLogin();
    }, 1500);
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex items-center justify-center relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white opacity-60 z-0"></div>
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl"></div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white/80 backdrop-blur-xl border border-white/50 rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg shadow-blue-900/20">
            <BarChart3 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">FinPartner <span className="text-slate-400 font-light">Pro</span></h1>
          <p className="text-slate-500 text-sm mt-2">AI-Powered Financial Planning & Analysis</p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-70 group"
          >
            {isLoading ? (
               <Loader2 size={20} className="animate-spin text-blue-600" />
            ) : (
               <>
                 <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                 <span>Continue with Google</span>
               </>
            )}
          </button>
          
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-xs text-slate-400 uppercase">Secure Enterprise Access</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-xs text-slate-500 space-y-2">
             <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Verified for <strong>FP&A Workflows</strong></span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Single Source of Truth <strong>(Dual-Screen)</strong></span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Encrypted Data Processing</span>
             </div>
          </div>
        </div>

        <div className="mt-8 text-center text-[10px] text-slate-400">
          By continuing, you agree to the Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
