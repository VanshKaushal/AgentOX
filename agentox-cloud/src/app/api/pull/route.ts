import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken, supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  // Auth
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) {
    return NextResponse.json({error:'Missing token'},{status:401});
  }
  const token = auth.replace('Bearer ', '');
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({error:'Invalid token'},{status:403});
  }

  // Get project name from query
  const { searchParams } = new URL(req.url);
  const projectName = searchParams.get('project');
  if (!projectName) {
    return NextResponse.json({error:'Missing ?project= param'},{status:400});
  }

  // Find project
  const { data: project } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .eq('name', projectName)
    .single();

  if (!project) {
    return NextResponse.json({
      error: `No cloud data for project "${projectName}". Push first with agentox push`,
      hint: 'Run: agentox push'
    }, { status: 404 });
  }

  // Get latest snapshot
  const { data: snapshot } = await supabaseAdmin
    .from('snapshots')
    .select('*')
    .eq('project_id', project.id)
    .order('synced_at', { ascending: false })
    .limit(1)
    .single();

  if (!snapshot) {
    return NextResponse.json({
      error: 'No snapshots found for this project'
    }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    project_name: projectName,
    data: {
      state: snapshot.state,
      tasks: snapshot.tasks,
      decisions: snapshot.decisions,
      history: snapshot.history,
      synced_at: snapshot.synced_at
    }
  });
}
