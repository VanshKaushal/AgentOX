import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth) return NextResponse.json({error:'No token'},{status:401});
  
  const { searchParams } = new URL(req.url);
  const project = searchParams.get('project');
  if (!project) return NextResponse.json(
    {error:'Missing project param'},{status:400}
  );

  try {
    const fs = require('fs');
    const os = require('os');
    const path = require('path');
    const tmpPath = path.join(os.tmpdir(), `agentox_${project}.json`);
    if (!fs.existsSync(tmpPath)) {
      return NextResponse.json(
        {error:`No synced data for project: ${project}`},
        {status:404}
      );
    }
    const data = JSON.parse(fs.readFileSync(tmpPath,'utf8'));
    return NextResponse.json({ success:true, data });
  } catch(e) {
    return NextResponse.json(
      {error:'Pull failed: '+(e as Error).message},
      {status:500}
    );
  }
}
