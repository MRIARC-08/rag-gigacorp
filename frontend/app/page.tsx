// frontend/app/page.tsx
// Verbose SaaS-style Landing Page

"use client"

import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState, FormEvent } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Database, BrainCircuit, BookOpenCheck, ShieldCheck, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [heroInput, setHeroInput] = useState("")

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/chat")
    }
  }, [status, router])

  const handleInstantStart = (e: FormEvent) => {
    e.preventDefault()
    if (heroInput.trim()) {
      router.push(`/chat?q=${encodeURIComponent(heroInput.trim())}`)
    } else {
      router.push("/chat")
    }
  }

  return (
    <div className="min-h-screen text-zinc-900 selection:bg-brand-500/20 font-sans overflow-x-hidden relative">
      
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0 border-zinc-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-brand-500 p-1.5 rounded-md shadow-sm shadow-brand-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold tracking-tight">GigaCorp AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="#features" className="text-zinc-600 hover:text-brand-500 transition-colors">Features</a>
            <a href="#architecture" className="text-zinc-600 hover:text-brand-500 transition-colors">Architecture</a>
            <button 
              onClick={() => signIn("google")}
              className="text-zinc-600 hover:text-brand-500 transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push("/chat")}
              className="bg-brand-500 text-white px-4 py-2 rounded-full hover:bg-brand-600 transition-colors shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        {/* Background Gradients */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10 flex flex-col items-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-500/30 bg-brand-500/5 text-brand-600 text-xs font-semibold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-brand-500"></span>
            Assignment 1: Support RAG Agent Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1]">
            Next-Gen Customer Support, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-orange-500">
              Powered by RAG.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-600 max-w-2xl mb-10 leading-relaxed font-medium">
            Experience an intelligent support assistant that dynamically retrieves shipping policies, return processes, and business hours directly from a localized vector knowledge base.
          </p>

          {/* Instant Start Input Box */}
          <form onSubmit={handleInstantStart} className="w-full max-w-2xl relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-500 to-orange-400 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative flex items-center glass rounded-2xl p-2 bg-white/50 border border-brand-500/20 focus-within:border-brand-500/50 shadow-sm">
              <input 
                type="text"
                value={heroInput}
                onChange={(e) => setHeroInput(e.target.value)}
                placeholder="Ask about GigaCorp's shipping to India..."
                className="flex-1 bg-transparent border-none text-zinc-900 px-4 py-3 focus:outline-none placeholder:text-zinc-500 text-lg font-medium"
              />
              <button 
                type="submit"
                className="bg-zinc-900 text-white hover:bg-zinc-800 px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-colors shadow-sm"
              >
                Ask AI <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-zinc-500 mt-4 font-semibold flex items-center justify-center gap-4">
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-brand-500"/> Secure Google OAuth</span>
              <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-brand-500"/> Instant Responses</span>
            </p>
          </form>
        </motion.div>
      </section>

      {/* Verbose Features Grid */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Architected for Precision</h2>
          <p className="text-zinc-600 max-w-2xl mx-auto font-medium">
            Not just another wrapper. GigaCorp AI uses an advanced Retrieval-Augmented Generation (RAG) pipeline to ensure factual accuracy and deep context retention.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="glass p-8 rounded-3xl border border-zinc-200 hover:border-brand-500/50 transition-colors group bg-white/40 shadow-sm hover:shadow-md">
            <div className="bg-brand-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <Database className="w-6 h-6 text-brand-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Mock Knowledge Base (RAG)</h3>
            <p className="text-zinc-600 leading-relaxed text-sm font-medium">
              We process a custom GigaCorp FAQ text file containing shipping policies, service tiers, and business hours. It's embedded and stored in a local vector store (FAISS/Chroma) for sub-second semantic retrieval.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="glass p-8 rounded-3xl border border-zinc-200 hover:border-orange-500/50 transition-colors group bg-white/40 shadow-sm hover:shadow-md">
            <div className="bg-orange-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BrainCircuit className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Conversational Memory</h3>
            <p className="text-zinc-600 leading-relaxed text-sm font-medium">
              The agent maintains persistent context across the conversation. Ask a follow-up question like "How much does it cost?" and the AI seamlessly resolves the coreference based on chat history.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="glass p-8 rounded-3xl border border-zinc-200 hover:border-red-500/50 transition-colors group bg-white/40 shadow-sm hover:shadow-md">
            <div className="bg-red-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <BookOpenCheck className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-bold mb-3">Explicit Citations</h3>
            <p className="text-zinc-600 leading-relaxed text-sm font-medium">
              Hallucinations are mitigated by strict grounding. Every factual claim is backed by a direct citation to the source document and line number, surfaced beautifully in the chat UI.
            </p>
          </div>
        </div>
      </section>

      {/* Deep Dive / Verbose Section */}
      <section id="architecture" className="py-24 px-6 border-t border-zinc-200 bg-white/40">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-6">Built with an industry-standard modern stack.</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="mt-1 bg-zinc-100 border border-zinc-200 p-2 rounded-lg h-fit"><div className="w-2 h-2 rounded-full bg-brand-500" /></div>
                <div>
                  <h4 className="font-bold mb-1">Backend Orchestration</h4>
                  <p className="text-zinc-600 text-sm font-medium">Python-powered backend utilizing LangChain and LangGraph for robust agentic workflows, connecting securely to OpenAI/Anthropic APIs.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-zinc-100 border border-zinc-200 p-2 rounded-lg h-fit"><div className="w-2 h-2 rounded-full bg-orange-500" /></div>
                <div>
                  <h4 className="font-bold mb-1">Frontend Excellence</h4>
                  <p className="text-zinc-600 text-sm font-medium">A highly responsive Next.js 15 application featuring React Server Components, Framer Motion animations, and Tailwind CSS for unparalleled UI/UX.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="mt-1 bg-zinc-100 border border-zinc-200 p-2 rounded-lg h-fit"><div className="w-2 h-2 rounded-full bg-red-500" /></div>
                <div>
                  <h4 className="font-bold mb-1">Free-Tier Hosting Ready</h4>
                  <p className="text-zinc-600 text-sm font-medium">Fully containerized and optimized to run flawlessly on platforms like Render, Streamlit Community Cloud, or Hugging Face Spaces.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/10 to-orange-500/10 blur-2xl rounded-[3rem]"></div>
            <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs text-zinc-500 ml-2 font-mono">terminal</span>
              </div>
              <pre className="text-sm font-mono text-zinc-300 overflow-x-auto">
                <code className="text-brand-400">const</code> userQuery = <span className="text-green-400">"Do you ship to India?"</span>;
                <br/><br/>
                <span className="text-zinc-500">// 1. Retrieve context via FAISS</span><br/>
                <code className="text-brand-400">const</code> context = <code className="text-blue-400">await</code> vectorStore.similaritySearch(userQuery);
                <br/><br/>
                <span className="text-zinc-500">// 2. Inject memory & context to LLM</span><br/>
                <code className="text-brand-400">const</code> response = <code className="text-blue-400">await</code> langChainAgent.invoke({`{`}<br/>
                &nbsp;&nbsp;query: userQuery,<br/>
                &nbsp;&nbsp;context: context,<br/>
                &nbsp;&nbsp;history: memory.load()<br/>
                {`}`});
                <br/><br/>
                <span className="text-zinc-500">// 3. Return response with citations</span><br/>
                <code className="text-brand-400">return</code> response;
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-zinc-500 text-sm border-t border-zinc-200 font-medium">
        <p>Assignment 1 • GigaCorp Customer Support RAG Agent • Built with Next.js & LangChain</p>
      </footer>
    </div>
  )
}
