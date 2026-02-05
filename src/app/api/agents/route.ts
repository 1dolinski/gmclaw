import { NextResponse } from 'next/server';
import { getAllAgents, registerAgent, getAgentCount, getAgentsWithStats } from '@/lib/db';

const STANDUP_LIMIT = 1000; // First 1000 agents can join without tweet

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';
    
    if (includeStats) {
      const agentsWithStats = await getAgentsWithStats();
      const count = agentsWithStats.length;
      return NextResponse.json(agentsWithStats, {
        headers: {
          'X-Agent-Count': String(count),
          'X-Standup-Remaining': String(Math.max(0, STANDUP_LIMIT - count)),
        }
      });
    }
    
    const agents = await getAllAgents();
    const count = await getAgentCount();
    return NextResponse.json(agents, {
      headers: {
        'X-Agent-Count': String(count),
        'X-Standup-Remaining': String(Math.max(0, STANDUP_LIMIT - count)),
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, owner, avatar, tweetUrl } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    // Check current agent count
    const currentCount = await getAgentCount();
    const isStandupOpen = currentCount < STANDUP_LIMIT;
    
    // Determine premium status (tweet verified)
    let premium = false;
    
    if (tweetUrl) {
      // Validate tweet URL format
      const tweetRegex = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
      if (!tweetRegex.test(tweetUrl)) {
        return NextResponse.json({ error: 'Invalid tweet URL format' }, { status: 400 });
      }
      premium = true;
    } else if (!isStandupOpen) {
      // After 1000 agents, tweet is required
      return NextResponse.json({ 
        error: 'Tweet verification is required (standup period ended)',
        standupClosed: true,
        agentCount: currentCount 
      }, { status: 400 });
    }

    const agent = await registerAgent({ name, description, owner, avatar, tweetUrl, premium });
    return NextResponse.json({ 
      ...agent, 
      standupRemaining: Math.max(0, STANDUP_LIMIT - currentCount - 1),
      premium 
    });
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json({ error: 'Failed to register agent' }, { status: 500 });
  }
}
