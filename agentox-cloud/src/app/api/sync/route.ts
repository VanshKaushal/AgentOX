import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserFromToken, 
  getOrCreateProject, 
  checkUsageLimit,
  incrementUsage,
  supabaseAdmin 
} from '@/lib/supabase';

export async function POST(req: NextRequest) {
  // Auth
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing token. Get one at agentox.dev/dashboard' },
      { status: 401 }
    );
  }
  const token = auth.replace('Bearer ', '');
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json(
      { error: 'Invalid token. Login at agentox.dev' },
      { status: 403 }
    );
  }

  // Check usage limit
  const usage = await checkUsageLimit(user.id);
  if (!usage.allowed) {
    return NextResponse.json({
      error: `Sync limit reached (${usage.syncs}/${usage.limit}). Upgrade at agentox.dev`,
      upgrade_url: 'https://agentox.dev/pricing'
    }, { status: 429 });
  }

  // Parse body
  let body: any;
  try { body = await req.json(); } 
  catch { return NextResponse.json({error:'Invalid JSON'},{status:400}); }

  const { project_name, state, tasks, decisions, history } = body;
  if (!project_name) {
    return NextResponse.json({error:'Missing project_name'},{status:400});
  }

  // Get or create project
  const project = await getOrCreateProject(user.id, project_name);
  if (!project) {
    return NextResponse.json({error:'Failed to create project'},{status:500});
  }

  // Save snapshot
  const { error: snapError } = await supabaseAdmin
    .from('snapshots')
    .insert({
      project_id: project.id,
      state: state || {},
      tasks: tasks || {},
      decisions: decisions || {},
      history: history || [],
      synced_at: new Date().toISOString()
    });

  if (snapError) {
    return NextResponse.json(
      { error: 'Failed to save: ' + snapError.message },
      { status: 500 }
    );
  }

  // Update project timestamp
  await supabaseAdmin
    .from('projects')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', project.id);

  // Increment usage
  await incrementUsage(user.id);

  return NextResponse.json({
    success: true,
    project: project_name,
    synced_at: new Date().toISOString(),
    usage: `${usage.syncs + 1}/${usage.limit} syncs`
  });
}
