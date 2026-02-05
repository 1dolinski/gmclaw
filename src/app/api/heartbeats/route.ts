import { NextResponse } from 'next/server';
import { getAllHeartbeats, updateHeartbeat, getHeartbeatHistory, appendHeartbeatHistory, getAllHeartbeatHistory } from '@/lib/db';

const FEED_PAGE_SIZE = 20;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agent');
    const history = searchParams.get('history');
    const page = parseInt(searchParams.get('page') || '1', 10);
    
    // If agent query param provided, return history for that agent
    if (agentName) {
      const agentHistory = await getHeartbeatHistory(agentName);
      return NextResponse.json(agentHistory);
    }
    
    // If history=true, return paginated activity feed
    if (history === 'true') {
      const skip = (page - 1) * FEED_PAGE_SIZE;
      const { entries, total } = await getAllHeartbeatHistory(skip, FEED_PAGE_SIZE);
      return NextResponse.json({
        entries,
        total,
        page,
        totalPages: Math.ceil(total / FEED_PAGE_SIZE),
        pageSize: FEED_PAGE_SIZE,
      });
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
