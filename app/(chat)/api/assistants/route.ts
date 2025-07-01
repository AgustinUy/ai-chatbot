import { NextRequest, NextResponse } from 'next/server';
import { getAssistantsByUserId, createAssistant } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userAssistants = await getAssistantsByUserId(session.user.id);

    return NextResponse.json(userAssistants);
  } catch (error) {
    console.error('Error fetching assistants:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assistants' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, instructions, persona } = await request.json();

    if (!name || !instructions) {
      return NextResponse.json(
        { error: 'Name and instructions are required' },
        { status: 400 }
      );
    }

    const newAssistant = await createAssistant({
      name,
      instructions,
      persona,
      userId: session.user.id,
    });

    return NextResponse.json(newAssistant, { status: 201 });
  } catch (error) {
    console.error('Error creating assistant:', error);
    return NextResponse.json(
      { error: 'Failed to create assistant' },
      { status: 500 }
    );
  }
}
