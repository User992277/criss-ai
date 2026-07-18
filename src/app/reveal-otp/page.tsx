"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, Copy, Check, Loader2, AlertCircle } from "lucide-react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500"], style: ["italic"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });

function RevealContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [otp, setOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing secure token.");
      return;
    }

    const fetchOtp = async () => {
      try {
        const res = await fetch(`/api/reveal-otp?token=${token}`);
        const data = await res.json();
        if (res.ok) {
          setOtp(data.otp_code);
        } else {
          setError(data.error || "This link has expired.");
        }
      } catch (err) {
        setError("Failed to connect to authentication server.");
      }
    };

    fetchOtp();
  }, [token]);

  const handleCopy = () => {
    if (otp) {
      navigator.clipboard.writeText(otp);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${mono.variable} min-h-screen flex flex-col items-center justify-center bg-[#0B0B12] text-[#F5F3EE] relative overflow-hidden font-[family-name:var(--font-body)]`}>
      
      {/* Cinematic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C9A570]/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      
      <div className="relative z-10 w-full max-w-md p-8 flex flex-col items-center text-center">
        <ShieldAlert className="text-[#C9A570] mb-6" size={48} />
        
        {error ? (
          <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl w-full flex flex-col items-center gap-3">
            <AlertCircle className="text-red-400" size={32} />
            <h2 className="text-red-400 font-medium">{error}</h2>
            <p className="text-white/40 text-sm">Please return to the login page and request a new code.</p>
          </div>
        ) : !otp ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#C9A570]" size={32} />
            <p className="text-white/40 animate-pulse">Decrypting secure transmission...</p>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            <h1 className="font-[family-name:var(--font-display)] text-3xl mb-2">Secure Code Revealed</h1>
            <p className="text-white/40 text-sm mb-10">Copy this code and paste it back into your login tab. This code expires in 5 minutes.</p>
            
            <div className="bg-[#14141E] border border-white/10 shadow-2xl p-8 rounded-3xl w-full flex flex-col items-center justify-center gap-6 relative group transition-all hover:border-[#C9A570]/30">
              <span className="font-[family-name:var(--font-mono)] text-5xl tracking-[0.2em] text-[#C9A570] font-medium drop-shadow-[0_0_15px_rgba(201,165,112,0.3)]">
                {otp}
              </span>
              
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 px-6 py-2.5 rounded-full transition-all text-sm font-medium text-white/80 cursor-pointer"
              >
                {copied ? <><Check size={16} className="text-green-400" /> Copied!</> : <><Copy size={16} /> Copy to Clipboard</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RevealOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0B0B12] flex items-center justify-center"><Loader2 className="animate-spin text-[#C9A570]" /></div>}>
      <RevealContent />
    </Suspense>
  );
}