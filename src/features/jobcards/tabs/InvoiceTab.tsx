import React, { useState, useEffect } from "react";
import { billingRepo } from "@/api/repositories/billingRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ModalHost as Modal } from "@/components/ui/Modal";
import { ConfirmDialogHost as ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { Plus, Receipt, History } from "lucide-react";

interface InvoiceTabProps {
  jobCardId: string;
}

export const InvoiceTab: React.FC<InvoiceTabProps> = ({ jobCardId }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const inv = await billingRepo.getInvoice(jobCardId);
      setInvoice(inv);
      if (inv) {
        const pms = await billingRepo.getPayments(inv.id);
        setPayments(pms || []);
      }
    } catch (err: any) {
      // If 404, it might just mean no invoice exists yet
      if (err.status !== 404) {
        setError("Failed to load billing information.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobCardId]);

  const handleCreateInvoice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      discount: Number(formData.get("discount")) || 0,
      taxPercent: Number(formData.get("taxPercent")) || 0,
      notes: formData.get("notes") as string,
    };

    try {
      await billingRepo.createInvoice(jobCardId, data);
      toast.success("Invoice created successfully");
      setIsInvoiceModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to create invoice");
    }
  };

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!invoice) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      amount: Number(formData.get("amount")),
      method: formData.get("method") as string,
      paidAt: new Date(formData.get("paidAt") as string).toISOString(),
      notes: formData.get("notes") as string,
    };

    try {
      await billingRepo.addPayment(invoice.id, data);
      toast.success("Payment added successfully");
      setIsPaymentModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to add payment");
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading billing info...</div>;
  if (error) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-danger)' }}>{error}</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
      {!invoice ? (
        <Card style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <Receipt size={48} style={{ color: 'var(--c-muted)' }} />
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No Invoice Generated</h3>
            <p style={{ color: 'var(--c-muted)', marginTop: '4px' }}>Generate an invoice to start accepting payments for this job card.</p>
          </div>
          <Button onClick={() => setIsInvoiceModalOpen(true)}>
            <Plus size={18} style={{ marginRight: '8px' }} />
            Create Invoice
          </Button>
        </Card>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <Card style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>Invoice Amount</span>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
                ${invoice.totalAmount?.toLocaleString() || '0.00'}
              </div>
            </Card>
            <Card style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>Paid Amount</span>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--c-success)' }}>
                ${invoice.paidAmount?.toLocaleString() || '0.00'}
              </div>
            </Card>
            <Card style={{ padding: '20px' }}>
              <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>Balance Due</span>
              <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: invoice.balance > 0 ? 'var(--c-danger)' : 'var(--c-success)' }}>
                ${invoice.balance?.toLocaleString() || '0.00'}
              </div>
            </Card>
          </div>

          <Card style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} style={{ color: 'var(--c-muted)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Payment History</h3>
              </div>
              <Button size="sm" onClick={() => setIsPaymentModalOpen(true)} disabled={invoice.balance <= 0}>
                <Plus size={16} style={{ marginRight: '6px' }} />
                Add Payment
              </Button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--c-bg-subtle)', borderBottom: '1px solid var(--c-border)' }}>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Date</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Method</th>
                  <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Notes</th>
                  <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-muted)' }}>No payments recorded yet.</td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                      <td style={{ padding: '12px 20px', fontSize: '14px' }}>{new Date(p.paidAt).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 20px', fontSize: '14px' }}>{p.method}</td>
                      <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--c-muted)' }}>{p.notes || '-'}</td>
                      <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>${p.amount?.toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create Invoice"
      >
        <form onSubmit={handleCreateInvoice} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>Discount Amount ($)</label>
              <input name="discount" type="number" step="0.01" defaultValue="0" style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>Tax Percent (%)</label>
              <input name="taxPercent" type="number" step="0.01" defaultValue="0" style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Notes</label>
            <textarea name="notes" rows={3} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</Button>
            <Button type="submit">Generate Invoice</Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Record Payment"
      >
        <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>Amount ($) *</label>
              <input name="amount" type="number" step="0.01" required defaultValue={invoice?.balance || 0} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500 }}>Method *</label>
              <select name="method" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }}>
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="TRANSFER">Transfer</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Payment Date *</label>
            <input name="paidAt" type="datetime-local" required defaultValue={new Date().toISOString().slice(0, 16)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Notes</label>
            <textarea name="notes" rows={3} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsPaymentModalOpen(false)}>Cancel</Button>
            <Button type="submit">Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
