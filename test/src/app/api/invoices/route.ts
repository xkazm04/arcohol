import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET: List all invoices
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get the organization from the user's session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = userData.organization_id;

    // Build query
    let query = supabase
      .from('invoices')
      .select('*, customer:customers(id, company_name, contact_name, email)')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) {
      query = query.eq('status', status);
    }
    if (customerId) {
      query = query.eq('customer_id', customerId);
    }

    const { data: invoices, error: invoicesError } = await query;

    if (invoicesError) {
      throw invoicesError;
    }

    // Get total count
    let countQuery = supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId);

    if (status) countQuery = countQuery.eq('status', status);
    if (customerId) countQuery = countQuery.eq('customer_id', customerId);

    const { count } = await countQuery;

    // Transform to frontend format
    const formattedInvoices = (invoices || []).map((inv) => ({
      id: inv.id,
      organizationId: inv.organization_id,
      customerId: inv.customer_id,
      customer: inv.customer
        ? {
            id: inv.customer.id,
            companyName: inv.customer.company_name,
            contactName: inv.customer.contact_name,
            email: inv.customer.email,
          }
        : undefined,
      reference: inv.reference,
      buyer: inv.buyer,
      subtotal: parseFloat(inv.subtotal),
      taxAmount: parseFloat(inv.tax_amount || '0'),
      discountAmount: parseFloat(inv.discount_amount || '0'),
      amount: parseFloat(inv.amount),
      feeRate: parseFloat(inv.fee_rate || '0'),
      feeAmount: parseFloat(inv.fee_amount || '0'),
      netAmount: parseFloat(inv.net_amount),
      currency: inv.currency,
      status: inv.status,
      issueDate: inv.issue_date,
      dueDate: inv.due_date,
      viewedAt: inv.viewed_at,
      paidAt: inv.paid_at,
      paymentUrl: inv.payment_url,
      lineItems: inv.line_items || [],
      notes: inv.notes,
      terms: inv.terms,
      metadata: inv.metadata,
      createdAt: inv.created_at,
      updatedAt: inv.updated_at,
    }));

    return NextResponse.json({
      invoices: formattedInvoices,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

// POST: Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const {
      customerId,
      lineItems = [],
      dueDate,
      notes,
      terms,
      taxRate = 0,
      discountAmount = 0,
      currency = 'USDC',
      metadata = {},
    } = body;

    // Validate required fields
    if (!customerId || !lineItems.length) {
      return NextResponse.json(
        { error: 'customerId and at least one line item are required' },
        { status: 400 }
      );
    }

    // Get the organization from the user's session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's organization
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData?.organization_id) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const organizationId = userData.organization_id;

    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('organization_id', organizationId)
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Calculate amounts
    const subtotal = lineItems.reduce(
      (sum: number, item: { quantity: number; unitPrice: number }) =>
        sum + item.quantity * item.unitPrice,
      0
    );
    const taxAmount = subtotal * (taxRate / 100);
    const amount = subtotal + taxAmount - discountAmount;
    const feeRate = 0.001; // 0.1% fee
    const feeAmount = amount * feeRate;
    const netAmount = amount - feeAmount;

    // Generate reference number
    const year = new Date().getFullYear();
    const { count } = await supabase
      .from('invoices')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .gte('created_at', `${year}-01-01`);

    const reference = `INV-${year}-${String((count || 0) + 1).padStart(4, '0')}`;

    // Prepare buyer snapshot
    const buyer = {
      company: customer.company_name,
      name: customer.contact_name,
      email: customer.email,
      walletAddress: customer.wallet_address,
    };

    // Create the invoice
    const { data: invoice, error: createError } = await supabase
      .from('invoices')
      .insert({
        organization_id: organizationId,
        customer_id: customerId,
        reference,
        buyer,
        subtotal,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        amount,
        fee_rate: feeRate,
        fee_amount: feeAmount,
        net_amount: netAmount,
        currency,
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: dueDate || null,
        line_items: lineItems.map((item: { description: string; quantity: number; unitPrice: number }) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.quantity * item.unitPrice,
        })),
        notes: notes || null,
        terms: terms || null,
        metadata,
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    return NextResponse.json({
      invoice: {
        id: invoice.id,
        reference: invoice.reference,
        customerId: invoice.customer_id,
        buyer: invoice.buyer,
        subtotal: parseFloat(invoice.subtotal),
        taxAmount: parseFloat(invoice.tax_amount),
        discountAmount: parseFloat(invoice.discount_amount),
        amount: parseFloat(invoice.amount),
        netAmount: parseFloat(invoice.net_amount),
        currency: invoice.currency,
        status: invoice.status,
        issueDate: invoice.issue_date,
        dueDate: invoice.due_date,
        lineItems: invoice.line_items,
        createdAt: invoice.created_at,
      },
    });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ error: 'Failed to create invoice' }, { status: 500 });
  }
}
