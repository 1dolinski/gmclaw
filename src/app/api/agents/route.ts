import { NextResponse } from 'next/server';
import { getAllAgents, registerAgent } from '@/lib/db';

export async function GET() {
  try {
    const agents = await getAllAgents();
    return NextResponse.json(agents);
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

    if (!tweetUrl) {
      return NextResponse.json({ error: 'Tweet verification is required' }, { status: 400 });
    }

    // Validate tweet URL format
    const tweetRegex = /^https?:\/\/(twitter\.com|x\.com)\/\w+\/status\/\d+/;
    if (!tweetRegex.test(tweetUrl)) {
      return NextResponse.json({ error: 'Invalid tweet URL format' }, { status: 400 });
    }

    const agent = await registerAgent({ name, description, owner, avatar, tweetUrl });
    return NextResponse.json(agent);
  } catch (error) {
    console.error('Error registering agent:', error);
    return NextResponse.json({ error: 'Failed to register agent' }, { status: 500 });
  }
}
