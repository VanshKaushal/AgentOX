import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, supabaseAdmin } from '@/lib/supabase';

// GET /api/token — returns user's current session token
// This IS the token they use for agentox CLI
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({error:'Not authenticated'},{status:401});
  }
  const token = auth.replace('Bearer ','');
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({error:'Invalid session'},{status:403});
  }

  const { data: usage } = await supabaseAdmin
    .from('usage')
    .select('tier, syncs_this_month')
    .eq('user_id', user.id)
    .single();

  return NextResponse.json({
    token,  // Supabase JWT = the CLI token
    email: user.email,
    tier: usage?.tier || 'free',
    syncs_this_month: usage?.syncs_this_month || 0,
    usage_hint: 'Set this as AGENTOX_TOKEN environment variable'
  });
}
