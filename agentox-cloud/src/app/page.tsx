import Link from 'next/link';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30">
      
      {/* Nav */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight">AgentOX</Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <a href="https://github.com" className="text-gray-400 hover:text-white transition-colors">GitHub</a>
            <Link href="/auth" className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
          v0.2.0 — Now with zero-git file tracking
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-white to-gray-400 text-transparent bg-clip-text">
          Switch AI agents without <br className="hidden md:block"/>
          re-explaining anything
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          AgentOX silently tracks what every AI builds in your project.
          Switch from Claude to Cursor to Windsurf — context carries over automatically.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="px-6 py-4 bg-black/50 border border-white/10 rounded-xl font-mono text-sm text-gray-300 flex items-center gap-3">
            <span className="text-gray-600">$</span>
            npm install -g agentox
          </div>
          <Link href="/auth" className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(99,102,241,0.3)]">
            Get Pro &rarr;
          </Link>
        </div>
        
        <p className="mt-8 text-sm text-gray-500">Free CLI · VSCode Extension · Works on any folder</p>
      </section>

      {/* GIF area */}
      <section className="px-6 max-w-5xl mx-auto mb-32">
        <div className="aspect-video w-full bg-black/50 border border-white/10 rounded-2xl flex flex-col items-center justify-center overflow-hidden relative shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-purple-500/10"></div>
          {/* Replace with actual GIF */}
          <div className="text-center z-10">
            <p className="text-2xl font-bold text-gray-300 mb-2">Demo GIF goes here</p>
            <p className="text-gray-500">Record with ScreenToGif</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-16">How it works</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Install once', desc: 'npm install -g agentox + VSCode extension. Done. Works on any project immediately.' },
              { step: '02', title: 'Work normally', desc: 'Use Claude, Cursor, Windsurf as you always do. AgentOX tracks everything silently.' },
              { step: '03', title: 'Switch freely', desc: 'Click Switch Agent. Context generated instantly. New AI picks up exactly where last one stopped.' }
            ].map(item => (
              <div key={item.step} className="relative">
                <div className="text-5xl font-black text-white/5 absolute -top-8 -left-4 select-none">{item.step}</div>
                <h3 className="text-xl font-bold mb-3 relative z-10">{item.title}</h3>
                <p className="text-gray-400 leading-relaxed relative z-10">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-16">Simple pricing</h2>
        
        <div className="grid md:grid-cols-3 gap-8 items-center">
          {[
            { name: 'Free', price: '$0', period: 'forever', features: ['CLI tool', 'VSCode extension', 'Local file tracking', 'MCP server', 'Bootstrap handoff prompt'], cta: 'Get started', href: 'https://npmjs.com/package/agentox', highlight: false },
            { name: 'Pro', price: '$12', period: '/month', features: ['Everything in Free', 'Cloud sync', 'Web dashboard', '10 projects', '90-day history', 'Any machine access'], cta: 'Get Pro', href: '/auth', highlight: true },
            { name: 'Team', price: '$25', period: '/seat/month', features: ['Everything in Pro', 'Shared context', 'Team dashboard', 'Unlimited projects', '1-year history', 'Priority support'], cta: 'Get Team', href: '/auth', highlight: false }
          ].map(tier => (
            <div key={tier.name} className={`relative p-8 rounded-3xl border ${tier.highlight ? 'bg-indigo-500/5 border-indigo-500/30 md:-translate-y-4 shadow-[0_0_40px_rgba(99,102,241,0.1)] z-10' : 'bg-black/50 border-white/10 relative z-0'}`}>
              {tier.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-full">
                  Most Popular
                </div>
              )}
              
              <h3 className="text-xl font-medium text-gray-400 mb-2">{tier.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-gray-500">{tier.period}</span>
              </div>
              
              <ul className="space-y-4 mb-8">
                {tier.features.map(f => (
                  <li key={f} className="flex items-start gap-3">
                    <svg className={`w-5 h-5 ${tier.highlight ? 'text-indigo-400' : 'text-gray-500'} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">{f}</span>
                  </li>
                ))}
              </ul>
              
              <Link href={tier.href} className={`block w-full py-3 px-6 text-center rounded-xl font-medium transition-colors ${tier.highlight ? 'bg-indigo-500 hover:bg-indigo-400 text-white' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}>
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 text-center text-gray-500">
        <div className="flex items-center justify-center gap-6 mb-4">
          <Link href="/" className="hover:text-white transition-colors">AgentOX</Link>
          <a href="https://github.com" className="hover:text-white transition-colors">GitHub</a>
          <Link href="/auth" className="hover:text-white transition-colors">Sign in</Link>
        </div>
        <p>&copy; {new Date().getFullYear()} AgentOX. All rights reserved.</p>
      </footer>
    </div>
  );
}
