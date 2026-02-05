import { NextResponse } from 'next/server';
import { getViews, incrementViews } from '@/lib/db';

export async function GET() {
  try {
    const views = await getViews();
    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error fetching views:', error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}

export async function POST() {
  try {
    const views = await incrementViews();
    return NextResponse.json({ views });
  } catch (error) {
    console.error('Error incrementing views:', error);
    return NextResponse.json({ views: 0 }, { status: 500 });
  }
}
