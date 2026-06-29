import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy_anon_key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_key';

// Client for browser (uses anon key + RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server routes (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper: get user from request token
export async function getUserFromToken(token: string) {
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

// Helper: get or create project
export async function getOrCreateProject(
  userId: string, 
  projectName: string
) {
  const { data: existing } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('name', projectName)
    .single();

  if (existing) return existing;

  const { data: created } = await supabaseAdmin
    .from('projects')
    .insert({ user_id: userId, name: projectName })
    .select()
    .single();

  return created;
}

// Helper: check usage limits
export async function checkUsageLimit(userId: string): Promise<{
  allowed: boolean;
  tier: string;
  syncs: number;
  limit: number;
}> {
  const { data } = await supabaseAdmin
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  const tier = data?.tier || 'free';
  const syncs = data?.syncs_this_month || 0;
  const limits: Record<string, number> = {
    free: 0,      // free = no cloud sync
    pro: 500,     // pro = 500 syncs/month
    team: 99999   // team = unlimited
  };
  const limit = limits[tier] || 0;

  return { allowed: syncs < limit, tier, syncs, limit };
}

// Helper: increment usage
export async function incrementUsage(userId: string) {
  const { data: existing } = await supabaseAdmin
    .from('usage')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabaseAdmin
      .from('usage')
      .update({ syncs_this_month: existing.syncs_this_month + 1 })
      .eq('user_id', userId);
  } else {
    await supabaseAdmin
      .from('usage')
      .insert({ user_id: userId, syncs_this_month: 1, tier: 'free' });
  }
}
