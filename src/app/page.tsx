"use client";

import { useState, useRef, useEffect } from "react";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import { 
  ArrowUp, MessageSquare, Plus, ShieldAlert, Loader2, MoreVertical, 
  Trash2, Share, Square, FileText, X, Paperclip, Menu, Terminal, LogOut,
  Search, Edit2, Check, Settings, Sun, Moon, Monitor, Zap, Copy
} from "lucide-react";
import { useRouter } from "next/navigation";

const fraunces = Fraunces({ subsets: ["latin"], weight: ["400", "500"], style: ["italic"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-body" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono" });
export default function DashboardPage() {

  interface Session { id: string; title: string; created_at: string; }

  const [editingTitle, setEditingTitle] = useState("");
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [activeFileNames, setActiveFileNames] = useState<string[]>([]);
  
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [isThinking, setIsThinking] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [currentQuery, setCurrentQuery] = useState("");
  const [currentHasFile, setCurrentHasFile] = useState(false);

  // NEW STYLING STATES FOR INTERACTIVE COMPONENT RETRIEVAL
  const [viewingFile, setViewingFile] = useState<{ name: string; content: string } | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); 
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController>(null);

  const [searchTerm, setSearchTerm] = useState("");
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark");
  const [copiedSessionId, setCopiedSessionId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string>("authenticated.user@criss-ai.online");



interface ChatMessage {
  role: string;
  content: string;
  fileNames?: string[];
}

interface ProcessingStatusProps { query: string; hasFile: boolean; }
function ProcessingStatus({ query, hasFile }: ProcessingStatusProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const getAuditSteps = () => {
    const lowerQuery = query.toLowerCase().trim();
    if (lowerQuery.match(/^(hi|hello|hey|morning|afternoon|evening|test)/)) return ["Initializing secure connection...", "Authenticating local session...", "Waking up language model...", "Preparing response..."];
    if (hasFile || lowerQuery.includes('scan') || lowerQuery.includes('audit') || lowerQuery.includes('vulnerability')) return ["Establishing secure sandbox...", "Parsing code syntax tree...", "Cross-referencing OWASP databases...", "Running static vulnerability analysis...", "Compiling security audit report..."];
    return ["Analyzing query parameters...", "Searching local knowledge base...", "Evaluating compliance rules...", "Synthesizing response..."];
  };
  const currentSteps = getAuditSteps();
  useEffect(() => {
    const interval = setInterval(() => setStepIndex((prev) => (prev + 1) % currentSteps.length), 4000); 
    return () => clearInterval(interval);
  }, [currentSteps.length]);

  // Handler to share chat link to clipboard



  return (
    <div className="flex items-start gap-4 max-w-2xl w-full my-4 ml-5">
      <div className="w-8 h-8 rounded-lg bg-[#C9A570]/10 border border-[#C9A570]/30 flex items-center justify-center shrink-0"><Terminal size={16} className="text-[#C9A570]" /></div>
      <div className="flex flex-col gap-2 pt-1.5">
        <div className="flex items-center gap-3">
          <Loader2 size={14} className="animate-spin text-[#C9A570]" />
          <span className="font-[family-name:var(--font-mono)] text-sm text-[#C9A570] animate-pulse">{currentSteps[stepIndex]}</span>
        </div>
        <div className="h-0.5 w-48 bg-white/5 rounded-full overflow-hidden mt-1 relative"><div className="absolute top-0 left-0 h-full bg-[#C9A570]/50 w-1/3 animate-slide" /></div>
      </div>
    </div>
  );
}

function highlightCode(code: string, lang: string) {
  const escapeHtml = (str: string) => str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const htmlEscaped = escapeHtml(code);
  
  // Single-pass regex to match comments, strings, or keywords sequentially
  const tokenRegex = /(\/\/.*|#.*)|((["'`])[\s\S]*?\3)|(\b(import|from|def|class|return|if|else|elif|while|for|in|try|except|as|with|const|let|var|function|async|await|export|default|extends|new|true|false|null|None)\b)/g;

  const highlighted = htmlEscaped.replace(tokenRegex, (match, comment, stringToken, quote, keyword) => {
    if (comment) return `<span class="text-white/40 font-italic">${comment}</span>`;
    if (stringToken) return `<span class="text-[#dab689]">${stringToken}</span>`;
    if (keyword) return `<span class="text-[#C9A570] font-medium">${keyword}</span>`;
    return match;
  });

  return <code dangerouslySetInnerHTML={{ __html: highlighted }} />;
}

function renderTableHTML(rows: string[][], key: string) {
  if (rows.length === 0) return null;
  const headers = rows[0];
  const bodyRows = rows.slice(1);

  return (
    <div key={key} className="my-6 overflow-hidden rounded-xl border border-white/10 bg-[#14141E]/40 backdrop-blur-md shadow-xl">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            {headers.map((cell, i) => (
              <th key={i} className="px-4 py-3 font-semibold text-[#C9A570] font-mono tracking-wider uppercase text-xs" dangerouslySetInnerHTML={{ __html: cell }} />
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/[0.04]">
          {bodyRows.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-white/[0.02] transition-colors align-top">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 text-[#F5F3EE]/85 leading-relaxed" dangerouslySetInnerHTML={{ __html: cell }} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}



function FormatMessageContent({ content }: { content: string }) {
  if (!content) return null;
  
  // Clean RAG artifacts from the rendering output interface
  const cleanedContent = content.replace(/<file_data>[\s\S]*?<\/file_data>/g, "").trim();
  const parts = cleanedContent.split(/```/g);
  
  return (
    <div className="space-y-4 text-[15px] leading-relaxed text-[#F5F3EE]/90">
      {parts.map((part, index) => {
        if (index % 2 === 0) {
          const lines = part.split("\n");
          const elements: React.ReactNode[] = [];
          let inTable = false;
          let tableRows: string[][] = [];

          const flushTable = (tableKey: string) => {
            if (tableRows.length > 0) {
              elements.push(renderTableHTML(tableRows, tableKey));
              tableRows = [];
            }
            inTable = false;
          };

          for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            const pipeCount = (line.match(/\|/g) || []).length;

            // Detect if line belongs to a markdown table matrix
            if (pipeCount >= 2 || (inTable && line.includes('|'))) {
              inTable = true;
              
              // Repair step: Handle rows split across physical newlines by the model
              if (!line.startsWith('|') && tableRows.length > 0) {
                const lastRow = tableRows[tableRows.length - 1];
                if (lastRow.length > 0) {
                  const cleanText = line.endsWith('|') ? line.slice(0, -1) : line;
                  lastRow[lastRow.length - 1] += "<br />" + cleanText.trim();
                  continue;
                }
              }

              // Parse out cells cleanly
              let cells = line.split('|').map(c => c.trim());
              if (line.startsWith('|')) cells.shift();
              if (line.endsWith('|')) cells.pop();

              // Skip structural separator syntax lines (|---|)
              const isSeparator = cells.every(cell => /^:-*-*:*$/.test(cell) || /^-+$/.test(cell));
              if (isSeparator) continue;

              tableRows.push(cells);
            } else {
              // Not a table line. If a table was building, close it out first.
              if (inTable) flushTable(`table-${index}-${i}`);

              if (line === "") {
                elements.push(<br key={`br-${index}-${i}`} />);
              } else {
                const formattedLine = line.replace(/\*\frac{}{}\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                elements.push(
                  <p 
                    key={`p-${index}-${i}`} 
                    className="mb-1" 
                    dangerouslySetInnerHTML={{ __html: formattedLine }} 
                  />
                );
              }
            }
          }
          if (inTable) flushTable(`table-${index}-final`);
          return elements;
        } else {
          // --- RESTORED CODE BLOCK EXPERT RENDERER ---
          const lines = part.split("\n");
          const firstLine = lines[0].trim();
          const lang = ["python", "py", "javascript", "js", "typescript", "ts", "html", "css", "json", "sql"].includes(firstLine.toLowerCase()) ? firstLine : "code";
          const codeContent = lang !== "code" ? lines.slice(1).join("\n") : lines.join("\n");
          return (
            <div key={index} className="my-4 overflow-hidden rounded-lg border border-white/10 bg-[#12121A] text-[#F5F3EE]">
              <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-4 py-1.5 text-xs font-mono text-white/40 uppercase tracking-wider">
                <span>{lang}</span>
                <button onClick={() => navigator.clipboard.writeText(codeContent.trim())} className="hover:text-[#C9A570] transition-colors cursor-pointer">Copy</button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-sm leading-6 whitespace-pre">{highlightCode(codeContent.trim(), lang)}</pre>
            </div>
          );
        }
      })}
    </div>
  );
}

  useEffect(() => {
    // 1. Check localStorage for stored user email first
    const storedEmail = localStorage.getItem("user_email");
    if (storedEmail) {
      setUserEmail(storedEmail);
    } else {
      // 2. Fallback check from JWT token if available
      const token = localStorage.getItem("csad_token");
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          if (payload && payload.email) setUserEmail(payload.email);
        } catch (e) {
          /* Fallback remains default */
        }
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("csad_token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const getAuthHeaders = (contentType: string | null = "application/json") => {
    const token = localStorage.getItem("csad_token");
    localStorage.setItem("user_email", userEmail);
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${token}`
    };
    if (contentType) {
      headers["Content-Type"] = contentType;
    }
    return headers;
  };
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);
  
  useEffect(() => { fetchSessions(); }, []);

  const handleLogout = () => { localStorage.removeItem("csad_token"); router.push("/login"); };

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/sessions",{
        headers: getAuthHeaders()
      });
      if (res.ok) setSessions(await res.json());
    } catch (e) { console.error("Failed to fetch sessions"); }
  };

  const handleLoadSession = async (id: string, title: string) => {
    setActiveSessionId(id);
    setActiveFileNames([]);
    setPendingFiles([]);
    setMenuOpenId(null);
    try {
      const res = await fetch(`/api/sessions/${id}`,{
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        // Parse raw database entries smoothly
        const mappedMessages = data.map((m: any) => {
          const fileMatch = m.content.match(/--- File: (.*?) ---/g);
          const cleanNames = fileMatch ? fileMatch.map((f: string) => f.replace(/--- File: | ---/g, "")) : [];
          return { role: m.role, content: m.content, fileNames: cleanNames };
        });
        setMessages(mappedMessages);
      }
    } catch (e) { console.error("Failed to load session history"); }
  };

  // FETCH BACKEND CODE FROM THE CLICKABLE WORKSPACE BADGE
  const handleViewFile = async (filename: string) => {
    setIsLoadingFile(true);
    try {
      const res = await fetch(`/api/files/${encodeURIComponent(filename)}`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setViewingFile({ name: data.filename, content: data.content });
      } else {
        alert("Failed to fetch internal structural artifact.");
      }
    } catch (e) {
      console.error("Retrieval error:", e);
    } finally {
      setIsLoadingFile(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      setPendingFiles(prev => [...prev, ...files].slice(0, 5));
    }
    if (fileInputRef.current) fileInputRef.current.value = ""; 
  };
  
  const removeFile = (indexToRemove: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleInputResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto'; 
    e.target.style.height = `${Math.min(e.target.scrollHeight, 300)}px`; 
  };

  const TOTAL_TOKENS = 250000;
  const [usedTokens, setUsedTokens] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("cris_used_tokens");
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });

  // Persist token usage locally
  useEffect(() => {
    localStorage.setItem("cris_used_tokens", usedTokens.toString());
  }, [usedTokens]);

  
  const handleSendMessage = async () => {
    if (!inputValue.trim() && pendingFiles.length === 0) return;
    if (isStreaming || isUploading) return;

    let uploadedNames = [...activeFileNames];
    setCurrentQuery(inputValue);
    setCurrentHasFile(pendingFiles.length > 0 || activeFileNames.length > 0);

    if (pendingFiles.length > 0) {
      setIsUploading(true);
      for (const file of pendingFiles) {
        const formData = new FormData();
        formData.append("file", file);
        try {
          const uploadRes = await fetch("/api/upload-scan", { method: "POST", body: formData, headers: getAuthHeaders(null) });
          const uploadData = await uploadRes.json();
          if (uploadRes.ok) uploadedNames.push(uploadData.filename);
        } catch (error) { console.error("Upload error for", file.name, error); }
      }
      setIsUploading(false);
    }
    
    const userMessage = inputValue;
    const filesToAttach = uploadedNames; 

    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = 'auto'; 
    
    setPendingFiles([]);
    setActiveFileNames([]); 
    setIsThinking(true);
    setIsStreaming(true);

    setMessages(prev => [...prev, { role: "user", content: userMessage, fileNames: filesToAttach }, { role: "ai", content: "" }]);
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ query: userMessage, filenames: filesToAttach, session_id: activeSessionId }),
        signal: abortControllerRef.current.signal
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let incomingBuffer = "";

      // Parses a single raw "data: ..." line into UI state.
      const processEvent = (rawLine: string) => {
        const line = rawLine.trim();
        if (!line.startsWith('data: ')) return;
        const dataStr = line.replace('data: ', '').trim();
        if (!dataStr || dataStr === '[DONE]') return;

        try {
          const data = JSON.parse(dataStr);
          if (data.session_id && !activeSessionId) {
            setActiveSessionId(data.session_id);
            fetchSessions();
          }
          if (data.text) {
            setIsThinking(false);
            
            // --- NEW: TOKEN DEDUCTION LOGIC ---
            // Calculates ~1 token per 4 characters streamed
            const newTokens = Math.max(1, Math.ceil(data.text.length / 4));
            setUsedTokens(prev => Math.min(TOTAL_TOKENS, prev + newTokens));
            // ----------------------------------

            setMessages(prev => {
              const newMessages = [...prev];
              const lastIdx = newMessages.length - 1;
              newMessages[lastIdx] = {
                ...newMessages[lastIdx],
                content: newMessages[lastIdx].content + data.text
              };
              return newMessages;
            });
          }
        } catch (e) { /* malformed/partial JSON fragment - drop silently */ }
      };

      
      const drainBuffer = (finalFlush = false) => {
        let boundary = incomingBuffer.indexOf('\n\n');
        while (boundary !== -1) {
          processEvent(incomingBuffer.slice(0, boundary));
          incomingBuffer = incomingBuffer.slice(boundary + 2);
          boundary = incomingBuffer.indexOf('\n\n');
        }
        if (finalFlush && incomingBuffer.trim().length > 0) {
          incomingBuffer.split('\n').filter(Boolean).forEach(processEvent);
          incomingBuffer = "";
        }
      };

      while (true) {
        const { value, done } = await reader.read();

        if (value) incomingBuffer += decoder.decode(value, { stream: !done });

        if (done) {
          // Flush any bytes still trapped inside the TextDecoder's internal buffer
          incomingBuffer += decoder.decode();
          drainBuffer(true);
          break;
        }
        

        drainBuffer(false);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIdx = newMessages.length - 1;
          // Preserve whatever already streamed in; only show an error if
          // truly nothing made it through before the connection dropped.
          if (!newMessages[lastIdx].content) {
            newMessages[lastIdx].content = "Error: Connection lost or buffered. Please refresh.";
          }
          return newMessages;
        });
      }
    } finally {
      setIsThinking(false);
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
      
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
  };
  
  // Handler to save renamed chat title to Flask backend
  const handleRenameSession = async (sessionId: string) => {
    if (!editingTitle.trim()) {
      setEditingSessionId(null);
      return;
    }
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: editingTitle }),
      });
      if (res.ok) {
        setSessions((prev: Session[]) =>
          prev.map(s => (s.id === sessionId ? { ...s, title: editingTitle } : s))
        );
      }
    } catch (e) {
      console.error("Failed to rename session:", e);
    } finally {
      setEditingSessionId(null);
      setEditingTitle("");
    }
  };

  const handleShareSession = (sessionId: string) => {
    const shareUrl = `${window.location.origin}?session=${sessionId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedSessionId(sessionId);
    setTimeout(() => setCopiedSessionId(null), 2000);
  };

  // --- REAL-TIME THEME ENGINE ---
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light-mode");
      root.classList.remove("dark");
    } else if (theme === "dark") {
      root.classList.remove("light-mode");
      root.classList.add("dark");
    } else if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (prefersDark) {
        root.classList.remove("light-mode");
        root.classList.add("dark");
      } else {
        root.classList.add("light-mode");
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  return (
    <div className={`${fraunces.variable} ${inter.variable} ${mono.variable} flex h-[100dvh] overflow-hidden bg-[#0B0B12] text-[#F2F0EA] font-[family-name:var(--font-body)] w-full`} onClick={() => setMenuOpenId(null)}>
      <div className="pointer-events-none absolute -top-40 left-[20%] h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-[#C9A570]/5 blur-[140px]" />
      
      {/* MOBILE OVERLAY (Closes sidebar when clicking outside on phones) */}
      {isSidebarOpen && (
        <div 
          className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div className={`absolute md:relative z-50 h-[100dvh] border-r border-white/5 bg-[#0F0F18]/95 md:bg-[#0F0F18]/80 backdrop-blur-xl flex flex-col justify-between shrink-0 transition-transform md:transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0 w-[260px]' : '-translate-x-full md:translate-x-0 w-[260px] md:w-0 overflow-hidden md:border-r-0'}`}>
        <div className="flex-1 flex flex-col overflow-hidden w-[260px]">
          
          {/* TOP SECTION: LOGO, NEW AUDIT & SEARCH */}
          <div className="p-4 pt-6 flex flex-col gap-4 shrink-0">
            <h1 className="font-[family-name:var(--font-display)] text-xl italic font-medium tracking-tight text-[#F5F3EE] flex items-center gap-2 pl-2">
              <ShieldAlert className="text-[#C9A570]" size={20}/>CRIS AI
            </h1>
            <button 
              onClick={() => { setMessages([]); setActiveSessionId(null); setActiveFileNames([]); setPendingFiles([]); }} 
              className="w-full flex items-center gap-3 rounded-xl bg-white/5 border border-white/5 px-4 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10 cursor-pointer shadow-sm"
            >
              <Plus className="text-[#C9A570]" size={16}/> <span>New Audit</span>
            </button>

            {/* CHAT SEARCH BAR */}
            <div className="relative w-full mt-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
              <input 
                type="text"
                placeholder="Search audits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F5F3EE] placeholder-white/30 focus:outline-none focus:border-[#C9A570]/40 font-mono transition-all"
              />
            </div>
          </div>

          {/* MIDDLE SECTION: CHAT HISTORY LIST WITH INLINE RENAME */}
          <div className="px-3 flex-1 overflow-y-auto pb-4 mt-1"> 
            <span className="text-[10px] font-medium text-white/30 uppercase pl-3 mb-2 block tracking-wider">Recent</span>
            <div className="space-y-1">
              {sessions
                .filter(session => session.title.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((session) => (
                <div key={session.id} className="relative group">
                  {editingSessionId === session.id ? (
                    <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-[#1A1A24] border border-[#C9A570]/40">
                      <input 
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleRenameSession(session.id); }}
                        autoFocus
                        className="w-full bg-transparent text-xs text-white focus:outline-none font-mono"
                      />
                      <button onClick={() => handleRenameSession(session.id)} className="text-[#C9A570] hover:text-white p-1">
                        <Check size={13} />
                      </button>
                      <button onClick={() => setEditingSessionId(null)} className="text-white/40 hover:text-white p-1">
                        <X size={13} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleLoadSession(session.id, session.title)} 
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${activeSessionId === session.id ? 'bg-[#1A1A24] text-white/90' : 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white/80'}`}
                      >
                        <MessageSquare className={`shrink-0 ${activeSessionId === session.id ? 'text-[#C9A570]' : 'text-white/40'}`} size={14}/>
                        <span className="truncate pr-4">{session.title}</span>
                      </button>
                      
                      <button 
                        onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.id ? null : session.id); }} 
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-opacity ${menuOpenId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      >
                        <MoreVertical size={14}/>
                      </button>
                      
                      {menuOpenId === session.id && (
                        <div className="absolute right-0 top-10 z-50 w-36 bg-[#1A1A24] border border-white/10 rounded-lg shadow-xl py-1 overflow-hidden" onClick={e => e.stopPropagation()}>
                          <button 
                            onClick={() => { setEditingSessionId(session.id); setEditingTitle(session.title); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                          >
                            <Edit2 size={12}/> Rename
                          </button>
                          <button 
                            onClick={() => { handleShareSession(session.id); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                          >
                            {copiedSessionId === session.id ? <Check size={12} className="text-green-400"/> : <Share size={12}/>}
                            {copiedSessionId === session.id ? "Link Copied!" : "Share Link"}
                          </button>
                          <button 
                            onClick={async (e) => { 
                              e.stopPropagation(); 
                              setSessions(sessions.filter(s => s.id !== session.id)); 
                              if(activeSessionId === session.id) { setMessages([]); setActiveSessionId(null); } 
                              setMenuOpenId(null); 
                              try { await fetch(`/api/sessions/${session.id}`, { method: 'DELETE' , headers: getAuthHeaders() }); } catch (error) {} 
                            }} 
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left border-t border-white/5 mt-1"
                          >
                            <Trash2 size={12}/> Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM FIXED UTILITIES CONTAINER */}
          <div className="p-4 border-t border-white/5 space-y-2 mt-auto shrink-0 bg-[#0B0B12]/40">
            <button 
              onClick={() => setIsSettingsOpen(true)} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-white/70 hover:text-[#C9A570] hover:bg-white/10 hover:border-[#C9A570]/30 transition-all text-xs font-medium cursor-pointer"
            >
              <Settings size={15}/> Settings & Preferences
            </button>
            
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all text-xs font-medium cursor-pointer"
            >
              <LogOut size={15}/> Disconnect Session
            </button>
          </div>

        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="relative z-10 flex-1 flex flex-col bg-[#0B0B12]">
        <header className="h-14 flex items-center justify-between px-6 shrink-0 border-b border-white/[0.03]">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition"><Menu size={18}/></button>
            <div className="font-[family-name:var(--font-display)] text-md text-white/80">CRISS AI</div>
          </div>
         
        </header>

        {/* CHAT LOG AREA */}
        <div className="relative flex-1 min-h-0 px-8 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch] flex flex-col items-center pb-6">
          {messages.length === 0 ? (
            <div className="my-auto text-center max-w-lg mt-32">
              <h2 className="font-[family-name:var(--font-display)] text-3xl mb-4 text-[#F5F3EE]">How can I help you today?</h2>
              <p className="text-white/40 text-sm leading-relaxed">Upload a vulnerability scan or ask a compliance question to begin an offline audit.</p>
            </div>
          ) : (
            <div className="w-full max-w-5xl space-y-8 py-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : msg.role === 'system' ? 'items-center' : 'items-start'}`}>
                  {msg.role === 'system' ? (
                     <div className="bg-blue-900/10 border border-blue-500/20 text-blue-400/80 font-[family-name:var(--font-mono)] text-[11px] px-4 py-2 rounded-lg">{msg.content}</div>
                  ) : (
                    <div className="max-w-[85%] flex flex-col gap-2">
                      
                      {/* INTERACTIVE CLICKABLE SOURCE CODE BADGES IN THE VIEWSTREAM */}
                      {msg.role === 'user' && msg.fileNames && msg.fileNames.length > 0 && (
                        <div className="flex flex-wrap items-center justify-end gap-2 mb-1">
                          {msg.fileNames.map((fname, i) => (
                            <button 
                              key={i} 
                              onClick={() => handleViewFile(fname)}
                              className="flex items-center gap-2 bg-[#14141E] border border-white/5 p-2 px-3 rounded-xl shadow-sm hover:border-[#C9A570]/40 hover:bg-[#C9A570]/5 text-white/60 hover:text-white transition-all cursor-pointer"
                              title="Click to view workspace source file"
                            >
                              <FileText className="text-[#C9A570] shrink-0" size={14}/>
                              <span className="text-xs font-[family-name:var(--font-mono)] tracking-tight truncate max-w-[180px]">{fname}</span>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {msg.role === 'ai' && !msg.content ? null : (
                        <div className={`px-5 py-4 rounded-3xl ${msg.role === 'user' ? 'bg-[#1A1A24] text-white/90 rounded-br-sm' : 'bg-transparent text-white/80'}`}>
                          {msg.role === 'ai' && (
                            <div className="flex items-center gap-2 mb-2 text-[#C9A570] text-[11px] font-semibold tracking-wider font-[family-name:var(--font-mono)] uppercase">
                              <ShieldAlert size={14}/> CRIS
                            </div>
                          )}
                          <div className="text-[15px] leading-relaxed text-[#F5F3EE]/90">
                            <FormatMessageContent content={msg.content}/>
                            {!isThinking && isStreaming && msg.role === 'ai' && idx === messages.length - 1 && (
                              <span className="inline-block w-1.5 h-3 bg-[#C9A570] ml-1 animate-pulse" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {isThinking && (
                <div className="flex w-full max-w-5xl justify-start">
                  <ProcessingStatus hasFile={currentHasFile} query={currentQuery}/>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* UNIFIED INPUT STRIP */}
        <div className="shrink-0 p-3 pb-[max(1rem,env(safe-area-inset-bottom))] md:p-6 md:pt-0 bg-gradient-to-t from-[#0B0B12] via-[#0B0B12] to-transparent">
          <div className="flex justify-center mb-4 h-8">
            {isStreaming && (
              <button onClick={() => abortControllerRef.current?.abort()} className="bg-[#1A1A24] border border-white/10 hover:border-[#C9A570]/50 text-white/60 hover:text-[#C9A570] px-4 py-1.5 rounded-full text-xs flex items-center gap-2 transition-all shadow-lg">
                <Square className="fill-current" size={10}/> Stop Generating
              </button>
            )}
          </div>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col bg-[#14141E]/90 backdrop-blur-xl p-2.5 rounded-3xl border border-white/10 shadow-2xl transition-all focus-within:border-white/20 focus-within:bg-[#1A1A24]/90">
              
              {/* MULTIPLE FILE PREVIEWS */}
              {pendingFiles.length > 0 && (
                <div className="px-2 pt-1 pb-3 flex gap-2 overflow-x-auto scrollbar-thin">
                  {pendingFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-[#0B0B12] p-2 pr-3 rounded-xl border border-white/10 shrink-0 relative group">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#C9A570]/30 bg-[#C9A570]/10 shrink-0">
                        <FileText className="text-[#C9A570]" size={14} />
                      </div>
                      <div className="flex flex-col pr-4">
                        <span className="text-[12px] font-medium text-white/90 truncate max-w-[140px]">{file.name}</span>
                        <span className="text-[10px] text-white/40 uppercase font-[family-name:var(--font-mono)] tracking-wide">{file.name.split('.').pop()} • {formatBytes(file.size)}</span>
                      </div>
                      <button onClick={() => removeFile(idx)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-black/40 text-white/60 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={12}/></button>
                    </div>
                  ))}
                </div>
              )}

              {/* FIXED ACTION LAYOUT ROW: SWITCHED TO items-end WITH BOTTOM PADDING FOR CLAUDE-STYLE ALIGNMENT */}
              <div className="flex items-end gap-2.5 px-1 pb-1">
                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept=".txt,.log,.json,.csv,.py,.js,.tsx,.ts,.html" />

                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isStreaming}
                  aria-label="Attach log file"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/40 transition hover:border-[#C9A570]/40 hover:bg-[#C9A570]/5 hover:text-[#C9A570] disabled:opacity-40 mb-0.5"
                >
                  <Paperclip size={18}/>
                </button>

                <div className="h-11 flex items-center shrink-0">
                  <Terminal className="text-white/20" size={16}/>
                </div>

                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputResize}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                  disabled={isStreaming}
                  placeholder="Ask CRIS AI "
                  className="w-full bg-transparent border-none py-3 px-1 text-[14px] font-[family-name:var(--font-mono)] text-[#F5F3EE] placeholder-white/25 focus:outline-none focus:ring-0 resize-none overflow-y-auto disabled:opacity-50 min-h-[44px] max-h-[300px]"
                  rows={1}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={isStreaming || isUploading || (!inputValue.trim() && pendingFiles.length === 0)}
                  aria-label="Send prompt"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9A570] to-[#dab689] text-[#0B0B12] transition hover:shadow-[0_0_20px_rgba(201,165,112,0.35)] disabled:opacity-30 disabled:bg-white/10 disabled:bg-none disabled:text-white/30 disabled:shadow-none mb-0.5"
                >
                  {isUploading ? <Loader2 className="animate-spin" size={18}/> : <ArrowUp size={18}/>}
                </button>
              </div>
            </div>
            <div className="text-center mt-3"><span className="text-[10px] text-white/20">CRIS AI can make mistakes. Verify critical security findings.</span></div>
          </div>
        </div>
      </div>

      {/* NEW COMPONENT: PREMIUM SOURCE OVERLAY MODAL FOR RENDERING SOURCE FILES INTERACTIVELY */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-6 sm:p-12" onClick={() => setViewingFile(null)}>
          <div className="bg-[#14141E] border border-white/10 w-full max-w-5xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <FileText className="text-[#C9A570]" size={18}/>
                <span className="font-[family-name:var(--font-mono)] text-sm font-medium text-white/80">{viewingFile.name}</span>
              </div>
              <button onClick={() => setViewingFile(null)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition cursor-pointer">
                <X size={18}/>
              </button>
            </div>
            <div className="flex-1 p-6 overflow-auto bg-[#0B0B12]/50 font-mono text-sm leading-relaxed text-[#F5F3EE]/90">
              <pre className="whitespace-pre overflow-x-auto select-text">
                {highlightCode(viewingFile.content, viewingFile.name.split('.').pop() || 'code')}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* DYNAMIC RETRIEVAL INTERCEPT LOADER SPIN OVERLAY */}
      {isLoadingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm pointer-events-all">
          <div className="bg-[#1A1A24] border border-white/10 p-4 px-6 rounded-xl flex items-center gap-3 shadow-2xl">
            <Loader2 className="animate-spin text-[#C9A570]" size={16}/>
            <span className="text-xs font-[family-name:var(--font-mono)] text-[#C9A570]">Retrieving artifact...</span>
          </div>
        </div>
      )}

      {/* CENTRALIZED SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4" onClick={() => setIsSettingsOpen(false)}>
          <div className="bg-[#14141E] border border-white/10 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-2">
                <Settings className="text-[#C9A570]" size={18}/>
                <span className="font-medium text-sm text-white/90">System Settings</span>
              </div>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition">
                <X size={18}/>
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              
              {/* ACCOUNT & TIER SECTION */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-white/40 block">Authenticated Account</span>
                  <span className="text-xs font-mono text-[#F5F3EE] truncate max-w-[220px] block">{userEmail}</span>
                </div>
                <div className="flex items-center gap-1.5 bg-[#C9A570]/10 border border-[#C9A570]/30 px-3 py-1 rounded-full">
                  <Zap size={12} className="text-[#C9A570] fill-current" />
                  <span className="text-[11px] font-mono font-semibold text-[#C9A570]">PRO ACCESS</span>
                </div>
              </div>

              {/* LIVE TOKEN USAGE METER */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-white/60">Free Tier Token Allowance</span>
                  <span className="text-[#C9A570]">
                    {(TOTAL_TOKENS - usedTokens).toLocaleString()} / {TOTAL_TOKENS.toLocaleString()} Tokens Left
                  </span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#C9A570] to-[#dab689] transition-all duration-300"
                    style={{ width: `${Math.max(0, ((TOTAL_TOKENS - usedTokens) / TOTAL_TOKENS) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-white/30">
                  <span>{(usedTokens).toLocaleString()} tokens consumed</span>
                  <span>Quota resets every 5 hours</span>
                </div>
              </div>

              {/* THEME TOGGLE */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-white/70 block">Appearance Theme</label>
                <div className="grid grid-cols-3 gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setTheme("dark")} 
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all ${theme === 'dark' ? 'bg-[#1A1A24] text-[#C9A570] border border-white/10 shadow-sm' : 'text-white/40 hover:text-white'}`}
                  >
                    <Moon size={13}/> Dark
                  </button>
                  <button 
                    onClick={() => setTheme("light")} 
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all ${theme === 'light' ? 'bg-[#1A1A24] text-[#C9A570] border border-white/10 shadow-sm' : 'text-white/40 hover:text-white'}`}
                  >
                    <Sun size={13}/> Light
                  </button>
                  <button 
                    onClick={() => setTheme("system")} 
                    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-mono transition-all ${theme === 'system' ? 'bg-[#1A1A24] text-[#C9A570] border border-white/10 shadow-sm' : 'text-white/40 hover:text-white'}`}
                  >
                    <Monitor size={13}/> System
                  </button>
                </div>
              </div>

              {/* TIER PARAMETERS OVERVIEW TABLE */}
              <div className="space-y-2 pt-2 border-t border-white/5">
                <span className="text-xs font-medium text-white/70 block">Tier Capabilities & Limits</span>
                <div className="rounded-xl border border-white/5 overflow-hidden text-xs font-mono">
                  <div className="grid grid-cols-2 p-2.5 bg-white/5 text-white/40 text-[10px] uppercase tracking-wider">
                    <span>Feature</span>
                    <span>Pro Parameter</span>
                  </div>
                  <div className="divide-y divide-white/5 text-white/70 bg-black/20">
                    <div className="grid grid-cols-2 p-2.5">
                      <span>Code Input Limit</span>
                      <span className="text-[#C9A570]">Up to 2,000 lines (Free) / 30k+ (Pro)</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5">
                      <span>Data Retention</span>
                      <span className="text-[#C9A570]">Permanent Storage</span>
                    </div>
                    <div className="grid grid-cols-2 p-2.5">
                      <span>Rate Limiter</span>
                      <span className="text-[#C9A570]">Anti-Bot Protection Active</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* MODAL FOOTER */}
            <div className="p-4 border-t border-white/5 bg-white/5 flex justify-end">
              <button onClick={() => setIsSettingsOpen(false)} className="px-4 py-2 rounded-xl bg-[#C9A570] text-[#0B0B12] text-xs font-medium font-mono hover:bg-[#dab689] transition">
                Done
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

