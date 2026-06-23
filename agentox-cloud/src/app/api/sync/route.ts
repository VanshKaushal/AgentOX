import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Missing token. Get one at agentox.dev' },
      { status: 401 }
    );
  }
  const token = auth.replace('Bearer ', '');
  
  // For local testing — accept "test_token"
  // For prod — validate against Supabase
  if (token !== 'test_token' && !process.env.SUPABASE_URL) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { project_name, state, tasks, decisions, history } = body;
    
    if (!project_name || !state) {
      return NextResponse.json(
        { error: 'Missing project_name or state' },
        { status: 400 }
      );
    }

    // Store in memory for local testing
    // Replace with Supabase in prod
    const stored = {
      project_name,
      state,
      tasks,
      decisions,
      history,
      synced_at: new Date().toISOString()
    };

    // Write to local temp file for testing
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const tmpPath = path.join(os.tmpdir(), `agentox_${project_name}.json`);
    fs.writeFileSync(tmpPath, JSON.stringify(stored, null, 2));

    return NextResponse.json({
      success: true,
      message: 'Context synced',
      project: project_name,
      synced_at: stored.synced_at
    });
  } catch(e) {
    return NextResponse.json(
      { error: 'Sync failed: ' + (e as Error).message },
      { status: 500 }
    );
  }
}
