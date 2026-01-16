import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { templateService } from '@/features/invoices';

// POST - Generate invoice from template
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const invoice = await templateService.generateInvoice(id, {
      customerId: body.customerId,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
      autoSend: body.autoSend,
    });

    if (!invoice) {
      return NextResponse.json(
        { error: 'Failed to generate invoice from template' },
        { status: 500 }
      );
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error('[API] Generate invoice error:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}
