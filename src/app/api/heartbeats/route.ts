import { NextResponse } from 'next/server';
import { getAllHeartbeats, updateHeartbeat, getHeartbeatHistory, appendHeartbeatHistory } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agent');
    
    // If agent query param provided, return history for that agent
    if (agentName) {
      const history = await getHeartbeatHistory(agentName);
      return NextResponse.json(history);
    }
    
    // Otherwise return all current heartbeats
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

    // Update current heartbeat
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
    
    // Also append to history (only if there's actual activity content)
    if (todo || workingOn || upcoming || done) {
      await appendHeartbeatHistory(agentName, { todo, workingOn, upcoming, done });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating heartbeat:', error);
    return NextResponse.json({ error: 'Failed to update heartbeat' }, { status: 500 });
  }
}
