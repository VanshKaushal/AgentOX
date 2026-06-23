import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30">
      <nav className="fixed w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold">
              OX
            </div>
            <span className="font-semibold tracking-tight">AgentOX Cloud</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link href="/dashboard" className="text-sm px-4 py-2 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors">
              Get Pro
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center max-w-4xl mx-auto mt-20 mb-32">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm text-indigo-300 mb-8">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              AgentOS v0.2.0 is now live
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-white via-white/90 to-white/40 bg-clip-text text-transparent">
              Open any project.<br/>Use any AI.<br/>Switch anytime.
            </h1>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              AgentOX remembers everything so you don't have to. Seamlessly sync your local continuity layer across machines and teams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/dashboard" className="px-8 py-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                Get Pro <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="px-8 py-4 rounded-full bg-white/5 border border-white/10 font-mono text-sm text-gray-300 flex items-center gap-3">
                <span className="text-gray-500">$</span> npm install -g agentox
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mt-32">
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <PricingCard 
                title="Free"
                price="$0"
                features={["Local continuity only", "CLI features", "No cloud sync"]}
              />
              <PricingCard 
                title="Pro"
                price="$12"
                popular
                features={["Cloud sync (push/pull)", "Web dashboard", "Up to 10 projects", "Access anywhere"]}
              />
              <PricingCard 
                title="Team"
                price="$25"
                features={["Everything in Pro", "Shared projects", "Team dashboard", "Who built what view"]}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PricingCard({ title, price, features, popular }: any) {
  return (
    <div className={`p-8 rounded-3xl border ${popular ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-white/10 bg-white/5'} backdrop-blur-sm relative overflow-hidden group`}>
      {popular && (
        <div className="absolute top-0 right-8 px-3 py-1 bg-indigo-500 text-xs font-bold rounded-b-lg">
          MOST POPULAR
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <div className="mb-8">
        <span className="text-4xl font-bold">{price}</span>
        {price !== '$0' && <span className="text-gray-400">/mo</span>}
      </div>
      <ul className="space-y-4 mb-8">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
            <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/60" />
            </div>
            {f}
          </li>
        ))}
      </ul>
      <button className={`w-full py-3 rounded-xl font-medium transition-colors ${popular ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-white/10 hover:bg-white/20'}`}>
        Get Started
      </button>
    </div>
  );
}
