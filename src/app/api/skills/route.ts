import { NextResponse } from 'next/server';
import { getAllSkills, registerSkill } from '@/lib/db';

export async function GET() {
  try {
    const skills = await getAllSkills();
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, url, version, category } = body;

    if (!name || !description || !url) {
      return NextResponse.json(
        { error: 'name, description, and url are required' },
        { status: 400 }
      );
    }

    const skill = await registerSkill({ name, description, url, version, category });
    return NextResponse.json(skill);
  } catch (error) {
    console.error('Error registering skill:', error);
    return NextResponse.json({ error: 'Failed to register skill' }, { status: 500 });
  }
}
