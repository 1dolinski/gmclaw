import { NextResponse } from 'next/server';
import { getAllHeartbeats, updateHeartbeat } from '@/lib/db';

export async function GET() {
  try {
    const heartbeats = await getAllHeartbeats();
    return NextResponse.json(heartbeats);
  } catch (error) {
    console.error('Error fetching heartbeats:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentName, name, walletAddress, pfpUrl, todo, workingOn, upcoming, done, contact } = body;

    if (!agentName) {
      return NextResponse.json({ error: 'agentName is required' }, { status: 400 });
    }

    const result = await updateHeartbeat(agentName, { 
      name, 
      walletAddress, 
      pfpUrl, 
      todo, 
      workingOn, 
      upcoming, 
      done, 
      contact 
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 });
  }
}
