'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

interface Project {
  id: string;
  name: string;
  updated_at: string;
}

interface Usage {
  tier: string;
  syncs_this_month: number;
}

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push('/auth'); return; }
      
      setToken(session.access_token);
      setEmail(session.user?.email || '');

      // Load projects
      const { data: proj } = await supabase
        .from('projects')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(10);
      setProjects(proj || []);

      // Load usage
      const { data: use } = await supabase
        .from('usage')
        .select('tier, syncs_this_month')
        .single();
      setUsage(use);
      
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleUpgrade() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ plan: 'pro' })
    });
    const { url } = await res.json();
    if (url) window.location.href = url;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/auth');
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] text-white">
      <p className="text-gray-400">Loading...</p>
    </div>
  );

  const tier = usage?.tier || 'free';
  const syncs = usage?.syncs_this_month || 0;
  const syncLimit = tier === 'pro' ? 500 : tier === 'team' ? '∞' : 0;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <h1 className="text-2xl font-bold">AgentOX Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1">{email}</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium uppercase tracking-wider">
              {tier}
            </span>
            <button 
              onClick={handleSignOut}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Token section */}
        <section className="p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
          <h2 className="text-lg font-bold mb-1">Your CLI Token</h2>
          <p className="text-sm text-gray-400 mb-4">Run this command once in your terminal to enable cloud sync</p>
          
          <div className="bg-black/50 p-4 rounded-lg font-mono text-sm break-all text-indigo-300">
            set AGENTOX_TOKEN={token.slice(0, 40)}...
          </div>
          
          <button 
            onClick={() => navigator.clipboard.writeText(`set AGENTOX_TOKEN=${token}`)}
            className="mt-3 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Copy full token command &rarr;
          </button>
        </section>

        {/* Usage */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-sm text-gray-400 mb-1">Syncs this month</p>
            <p className="text-2xl font-semibold">{syncs} <span className="text-gray-500 text-lg">/ {syncLimit}</span></p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-sm text-gray-400 mb-1">Projects</p>
            <p className="text-2xl font-semibold">{projects.length}</p>
          </div>
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl">
            <p className="text-sm text-gray-400 mb-1">Plan</p>
            <p className="text-2xl font-semibold capitalize">{tier}</p>
          </div>
        </section>

        {/* Upgrade banner for free users */}
        {tier === 'free' && (
          <section className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-amber-500 mb-1">Upgrade to Pro</h3>
              <p className="text-sm text-amber-500/70">Enable cloud sync. Access from any machine. $12/month.</p>
            </div>
            <button 
              onClick={handleUpgrade}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg transition-colors whitespace-nowrap"
            >
              Upgrade &rarr;
            </button>
          </section>
        )}

        {/* Projects list */}
        <section>
          <h2 className="text-lg font-bold mb-4">Your Projects</h2>
          
          {projects.length === 0 ? (
            <div className="p-12 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center">
              <p className="text-gray-400 font-medium mb-2">No projects synced yet.</p>
              <code className="bg-white/5 text-indigo-300 px-3 py-1 rounded text-sm mb-2">agentox push</code>
              <p className="text-xs text-gray-500">Run this in any project to sync it here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map(p => (
                <div key={p.id} className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between group hover:border-white/20 transition-colors">
                  <div>
                    <h3 className="font-medium">{p.name}</h3>
                    <p className="text-xs text-gray-500 mt-1">Last sync: {new Date(p.updated_at).toLocaleDateString()}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
