import { NextResponse } from 'next/server';
import { getRecentPulses } from '@/lib/db';

export async function GET() {
  try {
    const pulses = await getRecentPulses(50);
    return NextResponse.json(pulses);
  } catch (error) {
    console.error('Error fetching pulses:', error);
    return NextResponse.json([], { status: 500 });
  }
}
