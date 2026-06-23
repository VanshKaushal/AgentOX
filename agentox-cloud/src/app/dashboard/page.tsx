import Link from 'next/link';
import { ArrowLeft, Database, Activity, GitCommit, FileCode2 } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white">
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <span className="font-semibold tracking-tight">AgentOX Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-fuchsia-500" />
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Synced Projects</h1>
            <p className="text-gray-400">Manage your active continuity layers across machines.</p>
          </div>
          <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors">
            Manage Subscription
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard 
            name="express-backend" 
            agent="claude"
            tasks={12}
            drift={0.12}
            lastSync="2 mins ago"
          />
          <ProjectCard 
            name="nextjs-frontend" 
            agent="cursor"
            tasks={8}
            drift={0.45}
            lastSync="1 hour ago"
            warning
          />
          <div className="p-6 rounded-2xl border border-dashed border-white/20 flex flex-col items-center justify-center text-center gap-4 text-gray-400 hover:text-white hover:border-white/40 transition-colors cursor-pointer group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="font-medium">Sync a new project</p>
              <p className="text-sm mt-1">Run <code className="text-indigo-400">agentox push</code> locally</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProjectCard({ name, agent, tasks, drift, lastSync, warning }: any) {
  return (
    <div className={`p-6 rounded-2xl border ${warning ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/10 bg-white/5'} backdrop-blur-sm group hover:border-white/20 transition-colors`}>
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
            <FileCode2 className="w-5 h-5 text-indigo-300" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">{name}</h3>
            <p className="text-sm text-gray-400">Last synced {lastSync}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-3 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <Activity className="w-3 h-3" /> Active Agent
          </div>
          <p className="font-medium capitalize">{agent}</p>
        </div>
        <div className="p-3 rounded-lg bg-black/40 border border-white/5">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
            <GitCommit className="w-3 h-3" /> Drift Score
          </div>
          <p className={`font-medium ${warning ? 'text-amber-400' : 'text-emerald-400'}`}>
            {drift} {warning && '⚠'}
          </p>
        </div>
      </div>

      <button className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors border border-white/5">
        View Context
      </button>
    </div>
  );
}
