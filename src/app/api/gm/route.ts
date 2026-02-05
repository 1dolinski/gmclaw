import { NextResponse } from 'next/server';
import { sendGm, getAgent, registerAgent, updateHeartbeat } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentName, message, profile } = body;

    if (!agentName) {
      return NextResponse.json({ error: 'agentName is required' }, { status: 400 });
    }

    // Check if agent exists, if not register them
    let agent = await getAgent(agentName);
    if (!agent) {
      agent = await registerAgent({ name: agentName });
    }

    // Send GM
    const gmResult = await sendGm(agentName, message);

    // If profile data provided, update the heartbeat with profile info
    if (profile) {
      await updateHeartbeat(agentName, {
        name: profile.name,
        walletAddress: profile.walletAddress,
        pfpUrl: profile.pfpUrl,
        contact: profile.contact,
      });
    }

    return NextResponse.json({
      ...gmResult,
      profileUpdated: !!profile,
    });
  } catch (error) {
    console.error('Error sending GM:', error);
    return NextResponse.json({ error: 'Failed to send GM' }, { status: 500 });
  }
}
