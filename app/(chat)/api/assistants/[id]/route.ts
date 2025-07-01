import { NextRequest, NextResponse } from 'next/server';
import { updateAssistant, deleteAssistant } from '@/lib/db/queries';
import { auth } from '@/app/(auth)/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, instructions, persona } = await request.json();
    const { id } = await params;

    const updatedAssistant = await updateAssistant({
      id,
      userId: session.user.id,
      name,
      instructions,
      persona,
    });

    return NextResponse.json(updatedAssistant);
  } catch (error) {
    console.error('Error updating assistant:', error);
    return NextResponse.json(
      { error: 'Failed to update assistant' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    await deleteAssistant({
      id,
      userId: session.user.id,
    });

    return NextResponse.json({ message: 'Assistant deleted successfully' });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    return NextResponse.json(
      { error: 'Failed to delete assistant' },
      { status: 500 }
    );
  }
}
