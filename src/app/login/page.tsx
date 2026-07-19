"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, ArrowRight, Loader2,Terminal, Lock } from "lucide-react";
import { Fraunces, Inter } from "next/font/google";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

// The phrases it will cycle through
const auditSteps = [
  "Establishing secure connection...",
  "Parsing code syntax tree...",
  "Cross-referencing OWASP databases...",
  "Running static vulnerability analysis...",
  "Checking for memory leak patterns...",
  "Compiling security audit report..."
];

export function ProcessingStatus() {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Cycle to the next phrase every 3 seconds
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % auditSteps.length);
    }, 3000); 

    // Cleanup the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-start gap-4 max-w-2xl w-full my-4">
      {/* The AI Avatar / Terminal Icon */}
      <div className="w-8 h-8 rounded-lg bg-[#C9A570]/10 border border-[#C9A570]/30 flex items-center justify-center shrink-0">
        <Terminal size={16} className="text-[#C9A570]" />
      </div>

      {/* The Cycling Message */}
      <div className="flex flex-col gap-2 pt-1.5">
        <div className="flex items-center gap-3">
          <Loader2 size={14} className="animate-spin text-[#C9A570]" />
          <span className="font-[family-name:var(--font-mono)] text-sm text-[#C9A570] animate-pulse">
            {auditSteps[stepIndex]}
          </span>
        </div>
        
        {/* Optional: A subtle progress bar effect */}
        <div className="h-0.5 w-48 bg-white/5 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-[#C9A570]/50 w-1/3 animate-[slide_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500"], style: ["italic"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });

export default function LoginPage() {
  const router = useRouter();
  
  // UI States
  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // STEP 1: Request the OTP
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ text: "Secure link sent! Check your email.", type: "success" });
        setStep("otp"); // Flip the UI to show the OTP box!
      } else {
        setMessage({ text: data.error || "Failed to send link.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Cannot connect to server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify the OTP and Login
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        // Save the 1-year token so the user stays logged in
        localStorage.setItem("csad_token", data.access_token);
        setMessage({ text: "Authentication successful! Redirecting...", type: "success" });
        
        // Push the user to the main dashboard
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setMessage({ text: data.error || "Invalid OTP.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Cannot connect to server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };
  // GOOGLE OAUTH HANDLER
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: credentialResponse.credential }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("csad_token", data.access_token);
        setMessage({ text: "Authentication successful! Redirecting...", type: "success" });
        setTimeout(() => {
          router.push("/");
        }, 1000);
      } else {
        setMessage({ text: data.error || "Google authentication failed.", type: "error" });
      }
    } catch (error) {
      setMessage({ text: "Cannot connect to server.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="550572944421-c0rbkkhs40f6s6hsn0j16871e4vfi146.apps.googleusercontent.com
">
      
    <div className={`${fraunces.variable} ${inter.variable} min-h-screen flex bg-[#0B0B12] text-[#F5F3EE] font-[family-name:var(--font-body)]`}>
      
      {/* LEFT SIDE: The Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 xl:px-32 relative z-10">
        
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32 flex items-center gap-2">
          <ShieldAlert className="text-[#C9A570]" size={24} />
          <span className="font-[family-name:var(--font-display)] text-xl italic font-medium tracking-tight">CRISS AI</span>
        </div>
        

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-[family-name:var(--font-display)] mb-2">
            {step === "email" ? "Welcome back" : "Verify Identity"}
          </h1>
          <p className="text-white/40 mb-8 text-sm">
            {step === "email" 
              ? "Enter your email to receive a secure magic login code."
              : `Enter the 6-digit code sent to ${email}`
            }
          </p>

          {/* DYNAMIC FORM: Shows Email OR OTP based on state */}
          <form onSubmit={step === "email" ? handleRequestOtp : handleVerifyOtp} className="space-y-4">
            
            {step === "email" ? (
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                  Email Address
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
            ) : (
              <div>
                <label className="block text-xs font-medium text-white/50 uppercase tracking-wider mb-2">
                  Secure Code
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={16} className="text-[#C9A570]" />
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // Forces numbers only
                    placeholder="000000"
                    required
                    disabled={isLoading}
                    className="w-full bg-[#14141E] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-[#F5F3EE] tracking-[0.5em] font-mono placeholder:text-white/20 focus:outline-none focus:border-[#C9A570]/50 focus:ring-1 focus:ring-[#C9A570]/50 transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (step === "email" ? !email : otp.length !== 6)}
              className="w-full bg-[#C9A570] hover:bg-[#dab689] text-[#0B0B12] font-medium rounded-xl px-4 py-3.5 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : step === "email" ? (
                <>Send Magic Code <ArrowRight size={18} /></>
              ) : (
                <>Authenticate <ShieldAlert size={18} /></>
              )}
            </button>
          </form>

          {/* --- GOOGLE OAUTH SECTION --- */}
          <div className="mt-8 flex items-center justify-between">
            <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
            <span className="text-xs text-center text-white/30 uppercase tracking-widest font-medium">Or continue with</span>
            <span className="w-1/5 border-b border-white/10 lg:w-1/4"></span>
          </div>

          <div className="mt-6 flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setMessage({ text: "Google window closed or failed.", type: "error" })}
              theme="filled_black"
              shape="pill"
              text="continue_with"
            />
          </div>
          {/* --- END GOOGLE OAUTH SECTION --- */}


          {/* Back button if they made a typo in their email */}
          {step === "otp" && (
            <button 
              onClick={() => { setStep("email"); setOtp(""); setMessage(null); }}
              className="mt-4 text-xs text-white/30 hover:text-white/60 transition-colors w-full text-center"
            >
              Entered the wrong email? Go back.
            </button>
          )}

          {message && (
            <div className={`mt-6 p-4 rounded-xl text-sm border ${
              message.type === 'success' 
                ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}

          {/* 🚀 NEW: Dynamic Redirect Link to Signup Page */}
          {step === "email" && (
            <p className="mt-8 text-center text-sm text-white/40">
              {"Don't have an account? "}
              <a 
                href="/signup" 
                className="text-[#C9A570] hover:text-[#dab689] transition-colors font-medium"
              >
                Request access here
              </a>
            </p>
          )}

        </div>
      </div>

      {/* RIGHT SIDE: The Video Showcase */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#0F0F18] border-l border-white/5 overflow-hidden">
        
        {/* The Looping AI Background Video */}
        <video 
          src="/csad-login-bg.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen"
        />

        {/* Ambient Gradient Overlay to keep the text readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B12] via-transparent to-[#14141E]/50 pointer-events-none" />
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C9A570]/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="absolute bottom-12 left-12 right-12 z-10">
          <div className="bg-[#14141E]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl">
             <p className="text-white/80 font-[family-name:var(--font-display)] text-lg mb-2">"CRIS AI caught vulnerabilities in our React architecture that our manual audits completely missed."</p>
             <p className="text-white/40 text-sm font-medium uppercase tracking-wider font-[family-name:var(--font-mono)]">— Security Lead, FinTech Startup</p>
          </div>
        </div>
      </div>
      
    </div>
    </GoogleOAuthProvider>
  );
}