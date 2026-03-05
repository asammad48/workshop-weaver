import React, { useState, useEffect } from "react";
import { billingRepo } from "@/api/repositories/billingRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/forms/Select";
import { ModalContent } from "@/components/ui/Modal";
import { toast, openModal, closeModal } from "@/state/uiStore";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS, PaymentMethod } from "@/constants/enums";
import { Plus, Receipt, History, ChevronLeft, ChevronRight } from "lucide-react";

interface InvoiceTabProps {
    jobCardId: string;
}

const InvoiceCreateModalContent: React.FC<{ jobCardId: string; onCreated: () => void }> = ({ jobCardId, onCreated }) => {
    const [discount, setDiscount] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await billingRepo.createInvoice(jobCardId, {
                discount,
                taxPercent,
                notes
            });
            toast.success("Invoice created successfully");
            closeModal();
            onCreated();
        } catch (err) {
            toast.error("Failed to create invoice");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalContent
            footer={
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={closeModal} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={loading}>Generate Invoice</Button>
                </div>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label="Discount ($)" type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                    <Input label="Tax (%)" type="number" step="0.01" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500 }}>Notes</label>
                    <textarea
                        rows={3}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', resize: 'none' }}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>
        </ModalContent>
    );
};

const PaymentAddModalContent: React.FC<{ invoice: any; onAdded: () => void }> = ({ invoice, onAdded }) => {
    const [amount, setAmount] = useState(invoice.balance || 0);
    const [method, setMethod] = useState(PaymentMethod.CASH);
    const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (amount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }
        setLoading(true);
        try {
            await billingRepo.addPayment(invoice.id, {
                amount,
                method,
                paidAt: new Date(paidAt).toISOString(),
                notes
            });
            toast.success("Payment added successfully");
            closeModal();
            onAdded();
        } catch (err) {
            toast.error("Failed to add payment");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalContent
            footer={
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={closeModal} disabled={loading}>Cancel</Button>
                    <Button onClick={handleSubmit} loading={loading}>Record Payment</Button>
                </div>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label="Amount ($) *" type="number" step="0.01" required value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                    <Select
                        label="Method *"
                        options={PAYMENT_METHOD_OPTIONS}
                        value={method}
                        onChange={(e) => setMethod(Number(e.target.value))}
                    />
                </div>
                <Input label="Payment Date *" type="datetime-local" required value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500 }}>Notes</label>
                    <textarea
                        rows={3}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', resize: 'none' }}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </div>
            </div>
        </ModalContent>
    );
};

export const InvoiceTab: React.FC<InvoiceTabProps> = ({ jobCardId }) => {
    const [invoice, setInvoice] = useState<any>(null);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const pageSize = 10;

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

    const totalPages = Math.ceil(payments.length / pageSize) || 1;
    const paginatedPayments = payments.slice((page - 1) * pageSize, page * pageSize);

    const handleCreateInvoiceModal = () => {
        openModal('Create Invoice', <InvoiceCreateModalContent jobCardId={jobCardId} onCreated={fetchData} />);
    };

    const handleAddPaymentModal = () => {
        if (!invoice) return;
        openModal('Record Payment', <PaymentAddModalContent invoice={invoice} onAdded={fetchData} />);
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
                    <Button onClick={handleCreateInvoiceModal}>
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
                                EUR {invoice.total?.toLocaleString() || '0.00'}
                            </div>
                        </Card>
                        <Card style={{ padding: '20px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>Paid Amount</span>
                            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--c-success)' }}>
                                    EUR {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </Card>
                        <Card style={{ padding: '20px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>Balance Due</span>
                            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: invoice.balance > 0 ? 'var(--c-danger)' : 'var(--c-success)' }}>
                                    EUR {((invoice.total || 0) - payments.reduce((sum, p) => sum + (p.amount || 0), 0))
                                        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </Card>
                    </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                            <Card style={{ padding: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>SubTotal Amount</span>
                                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
                                    EUR {invoice.subtotal?.toLocaleString() || '0.00'}
                                </div>
                            </Card>
                            <Card style={{ padding: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>Discount Percentage</span>
                                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--c-success)' }}>
                                    % {invoice.discount?.toLocaleString() || '0.00'}
                                </div>
                            </Card>
                            <Card style={{ padding: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>Tax Percentage</span>
                                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: invoice.balance > 0 ? 'var(--c-danger)' : 'var(--c-success)' }}>
                                    % {invoice.tax?.toLocaleString() || '0.00'}
                                </div>
                            </Card>
                        </div>
                    <Card style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <History size={18} style={{ color: 'var(--c-muted)' }} />
                                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Payment History</h3>
                            </div>
                            <Button size="sm" onClick={handleAddPaymentModal} disabled={invoice.balance <= 0}>
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
                                    paginatedPayments.map((p) => (
                                        <tr key={p.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                                            <td style={{ padding: '12px 20px', fontSize: '14px' }}>{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
                                            <td style={{ padding: '12px 20px', fontSize: '14px' }}>{PAYMENT_METHOD_LABELS[p.method] || p.method}</td>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--c-muted)' }}>{p.notes || '-'}</td>
                                            <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>${p.amount?.toLocaleString()}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        <div style={{ padding: '16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '14px', color: 'var(--c-muted)' }}>
                                Page {page} of {totalPages}
                            </span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                                    <ChevronLeft size={16} />
                                </Button>
                                <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
                                    <ChevronRight size={16} />
                                </Button>
                            </div>
                        </div>
                    </Card>
                </>
            )}
        </div>
    );
};
