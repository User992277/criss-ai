"use client";

import { useState } from "react";
import { ShieldAlert, ArrowRight, Loader2, Key } from "lucide-react";
import { Fraunces, Inter } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500"], style: ["italic"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Magic link sent! Please check your email to verify.", type: "success" });
        setEmail("");
        setPassword("");
      } else {
        setMessage({ text: data.error || "Failed to register.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Cannot connect to server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${fraunces.variable} ${inter.variable} min-h-screen flex bg-[#0B0B12] text-[#F5F3EE] font-[family-name:var(--font-body)]`}>
      
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10">
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 flex items-center gap-2">
          <ShieldAlert className="text-[#C9A570]" size={24} />
          <span className="font-[family-name:var(--font-display)] text-xl italic font-medium tracking-tight">CRIS AI</span>
        </div>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-[family-name:var(--font-display)] mb-2">Request Access</h1>
          <p className="text-white/40 mb-8 text-sm">Create your master password and verify your email.</p>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Work Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                disabled={isLoading}
                className="w-full bg-[#14141E] border border-white/10 rounded-xl px-4 py-3.5 text-[#F5F3EE] placeholder:text-white/20 focus:outline-none focus:border-[#C9A570]/50 focus:ring-1 focus:ring-[#C9A570]/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                Master Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Key size={16} className="text-white/30" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  disabled={isLoading}
                  className="w-full bg-[#14141E] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[#F5F3EE] placeholder:text-white/20 focus:outline-none focus:border-[#C9A570]/50 focus:ring-1 focus:ring-[#C9A570]/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full mt-2 bg-[#C9A570] hover:bg-[#dab689] text-[#0B0B12] font-medium rounded-xl px-4 py-3.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <>Initialize Account <ArrowRight size={18} /></>}
            </button>
          </form>

          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm border ${
              message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          <p className="mt-8 text-center text-sm text-white/40">
            Already have an account? <a href="/login" className="text-[#C9A570] hover:text-[#dab689] transition-colors">Sign in here</a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Video Showcase */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0F0F18] border-l border-white/5 overflow-hidden">
        
        <video 
          src="/csad-login-bg.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />

        {/* Ambient Gradient Overlay (Keeps the background moody) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-[#14141E]/50 pointer-events-none" />
        
        {/* Subtle center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A570]/10 blur-[120px] rounded-full pointer-events-none" />
      </div>
    </div>
  );
}