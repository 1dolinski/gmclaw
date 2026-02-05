import { NextResponse } from 'next/server';
import { sendGm, getAgent, registerAgent } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentName, message } = body;

    if (!agentName) {
      return NextResponse.json({ error: 'agentName is required' }, { status: 400 });
    }

    // Check if agent exists, if not register them
    let agent = await getAgent(agentName);
    if (!agent) {
      agent = await registerAgent({ name: agentName });
    }

    // Send GM
    const result = await sendGm(agentName, message);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error sending GM:', error);
    return NextResponse.json({ error: 'Failed to send GM' }, { status: 500 });
  }
}
