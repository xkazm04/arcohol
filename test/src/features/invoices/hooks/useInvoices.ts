import { useState, useEffect, useCallback } from 'react';
import type {
  Invoice,
  InvoicePayment,
  CreateInvoiceParams,
  UpdateInvoiceParams,
  MarkPaidParams,
  ListInvoicesParams,
} from '../types';

interface UseInvoicesResult {
  // Invoices
  invoices: Invoice[];
  total: number;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;

  // Single invoice
  getInvoice: (id: string) => Promise<{ invoice: Invoice; payments: InvoicePayment[] } | null>;
  isFetchingSingle: boolean;

  // Create
  createInvoice: (params: CreateInvoiceParams) => Promise<Invoice | null>;
  isCreating: boolean;
  createError: Error | null;

  // Update
  updateInvoice: (id: string, params: UpdateInvoiceParams) => Promise<Invoice | null>;
  isUpdating: boolean;
  updateError: Error | null;

  // Delete
  deleteInvoice: (id: string) => Promise<boolean>;
  isDeleting: boolean;
  deleteError: Error | null;

  // Send
  sendInvoice: (id: string) => Promise<Invoice | null>;
  isSending: boolean;
  sendError: Error | null;

  // Mark paid
  markAsPaid: (id: string, params?: MarkPaidParams) => Promise<Invoice | null>;
  isMarkingPaid: boolean;
  markPaidError: Error | null;
}

export function useInvoices(params?: ListInvoicesParams): UseInvoicesResult {
  // List state
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Single fetch state
  const [isFetchingSingle, setIsFetchingSingle] = useState(false);

  // Create state
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<Error | null>(null);

  // Update state
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<Error | null>(null);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<Error | null>(null);

  // Send state
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState<Error | null>(null);

  // Mark paid state
  const [isMarkingPaid, setIsMarkingPaid] = useState(false);
  const [markPaidError, setMarkPaidError] = useState<Error | null>(null);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const searchParams = new URLSearchParams();
      if (params?.status) searchParams.set('status', params.status);
      if (params?.customerId) searchParams.set('customerId', params.customerId);
      if (params?.limit) searchParams.set('limit', String(params.limit));
      if (params?.offset) searchParams.set('offset', String(params.offset));

      const response = await fetch(`/api/invoices?${searchParams.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoices');
      }

      const data = await response.json();
      setInvoices(data.invoices);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [params?.status, params?.customerId, params?.limit, params?.offset]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const getInvoice = useCallback(async (id: string) => {
    try {
      setIsFetchingSingle(true);

      const response = await fetch(`/api/invoices/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch invoice');
      }

      const data = await response.json();
      return {
        invoice: data.invoice,
        payments: data.payments,
      };
    } catch (err) {
      console.error('Error fetching invoice:', err);
      return null;
    } finally {
      setIsFetchingSingle(false);
    }
  }, []);

  const createInvoice = useCallback(async (createParams: CreateInvoiceParams): Promise<Invoice | null> => {
    try {
      setIsCreating(true);
      setCreateError(null);

      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create invoice');
      }

      const data = await response.json();
      setInvoices((prev) => [data.invoice, ...prev]);
      setTotal((prev) => prev + 1);
      return data.invoice;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setCreateError(error);
      return null;
    } finally {
      setIsCreating(false);
    }
  }, []);

  const updateInvoice = useCallback(async (id: string, updateParams: UpdateInvoiceParams): Promise<Invoice | null> => {
    try {
      setIsUpdating(true);
      setUpdateError(null);

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateParams),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update invoice');
      }

      const data = await response.json();
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data.invoice } : inv)));
      return data.invoice;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setUpdateError(error);
      return null;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const deleteInvoice = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/invoices/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete invoice');
      }

      setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      setTotal((prev) => prev - 1);
      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setDeleteError(error);
      return false;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  const sendInvoice = useCallback(async (id: string): Promise<Invoice | null> => {
    try {
      setIsSending(true);
      setSendError(null);

      const response = await fetch(`/api/invoices/${id}/send`, {
        method: 'POST',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send invoice');
      }

      const data = await response.json();
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data.invoice } : inv)));
      return data.invoice;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setSendError(error);
      return null;
    } finally {
      setIsSending(false);
    }
  }, []);

  const markAsPaid = useCallback(async (id: string, markPaidParams?: MarkPaidParams): Promise<Invoice | null> => {
    try {
      setIsMarkingPaid(true);
      setMarkPaidError(null);

      const response = await fetch(`/api/invoices/${id}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(markPaidParams || {}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to mark invoice as paid');
      }

      const data = await response.json();
      setInvoices((prev) => prev.map((inv) => (inv.id === id ? { ...inv, ...data.invoice } : inv)));
      return data.invoice;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setMarkPaidError(error);
      return null;
    } finally {
      setIsMarkingPaid(false);
    }
  }, []);

  return {
    invoices,
    total,
    isLoading,
    error,
    refetch: fetchInvoices,
    getInvoice,
    isFetchingSingle,
    createInvoice,
    isCreating,
    createError,
    updateInvoice,
    isUpdating,
    updateError,
    deleteInvoice,
    isDeleting,
    deleteError,
    sendInvoice,
    isSending,
    sendError,
    markAsPaid,
    isMarkingPaid,
    markPaidError,
  };
}
