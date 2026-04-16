import React, { useState, useEffect } from "react";
import { billingRepo } from "@/api/repositories/billingRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/forms/Select";
import { ModalContent } from "@/components/ui/Modal";
import { toast, openModal, closeModal } from "@/state/uiStore";
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_OPTIONS, PaymentMethod } from "@/constants/enums";
import { Plus, Receipt, History, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { invoicesRepo } from "@/api/repositories/invoicesRepo";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";

interface InvoiceTabProps {
    jobCardId: string;
}

const InvoiceCreateModalContent: React.FC<{ jobCardId: string; onCreated: () => void }> = ({ jobCardId, onCreated }) => {
    const { t } = useI18n();
    const [discount, setDiscount] = useState(0);
    const [taxPercent, setTaxPercent] = useState(0);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        setLoading(true);
        try {
            await billingRepo.createInvoice(jobCardId, {
                discount,
                tax: taxPercent,
                notes
            });
            toast.success(t("jobCards.invoiceTab.invoiceCreated"));
            closeModal();
            onCreated();
        } catch (err) {
            toast.error(t("jobCards.invoiceTab.invoiceCreateFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalContent
            footer={
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={closeModal} disabled={loading}>{t("jobCards.header.actions.cancel")}</Button>
                    <Button onClick={handleSubmit} loading={loading}>{t("jobCards.invoiceTab.generateInvoice")}</Button>
                </div>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label={t("jobCards.invoiceTab.discount")} type="number" step="0.01" value={discount} onChange={(e) => setDiscount(Number(e.target.value))} />
                    <Input label={t("jobCards.invoiceTab.tax")} type="number" step="0.01" value={taxPercent} onChange={(e) => setTaxPercent(Number(e.target.value))} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500 }}>{t("jobCards.invoiceTab.notes")}</label>
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
    const { t } = useI18n();
    const [amount, setAmount] = useState(invoice.balance || 0);
    const [method, setMethod] = useState(PaymentMethod.CASH);
    const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 16));
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (amount <= 0) {
            toast.error(t("jobCards.invoiceTab.amountMustBePositive"));
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
            toast.success(t("jobCards.invoiceTab.paymentAdded"));
            closeModal();
            onAdded();
        } catch (err) {
            toast.error(t("jobCards.invoiceTab.paymentAddFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalContent
            footer={
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <Button variant="secondary" onClick={closeModal} disabled={loading}>{t("jobCards.header.actions.cancel")}</Button>
                    <Button onClick={handleSubmit} loading={loading}>{t("jobCards.invoiceTab.recordPayment")}</Button>
                </div>
            }
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label={t("jobCards.invoiceTab.amount")} type="number" step="0.01" required value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                    <Select
                        label={t("jobCards.invoiceTab.method")}
                        options={PAYMENT_METHOD_OPTIONS}
                        value={method}
                        onChange={(e) => setMethod(Number(e.target.value))}
                    />
                </div>
                <Input label={t("jobCards.invoiceTab.paymentDate")} type="datetime-local" required value={paidAt} onChange={(e) => setPaidAt(e.target.value)} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 500 }}>{t("jobCards.invoiceTab.notes")}</label>
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
    const { t } = useI18n();
    const { user } = useAuth();
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
                setError(t("jobCards.invoiceTab.loadFailed"));
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
        openModal(t('jobCards.invoiceTab.createInvoice'), <InvoiceCreateModalContent jobCardId={jobCardId} onCreated={fetchData} />);
    };

    const handleAddPaymentModal = () => {
        if (!invoice) return;
        openModal(t('jobCards.invoiceTab.recordPayment'), <PaymentAddModalContent invoice={invoice} onAdded={fetchData} />);
    };

    const handlePrintInvoice = () => {
        if (!invoice) return;
        invoicesRepo.openPrint(invoice.id);
    };

    const canPrintInvoice =
        user?.role === "HQ_ADMIN" ||
        user?.role === "BRANCH_MANAGER" ||
        user?.role === "CASHIER";

    if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>{t("jobCards.invoiceTab.loading")}</div>;
    if (error) return <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-danger)' }}>{error}</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
            {!invoice ? (
                <Card style={{ padding: '48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <Receipt size={48} style={{ color: 'var(--c-muted)' }} />
                    <div>
                        <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{t("jobCards.invoiceTab.noInvoiceTitle")}</h3>
                        <p style={{ color: 'var(--c-muted)', marginTop: '4px' }}>{t("jobCards.invoiceTab.noInvoiceDescription")}</p>
                    </div>
                    <Button onClick={handleCreateInvoiceModal}>
                        <Plus size={18} style={{ marginRight: '8px' }} />
                        {t("jobCards.invoiceTab.createInvoice")}
                    </Button>
                </Card>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                        <Card style={{ padding: '20px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{t("jobCards.invoiceTab.invoiceAmount")}</span>
                            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
                                EUR {invoice.total?.toLocaleString() || '0.00'}
                            </div>
                        </Card>
                        <Card style={{ padding: '20px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{t("jobCards.invoiceTab.paidAmount")}</span>
                            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--c-success)' }}>
                                    EUR {payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </Card>
                        <Card style={{ padding: '20px' }}>
                            <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{t("jobCards.invoiceTab.balanceDue")}</span>
                            <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: invoice.balance > 0 ? 'var(--c-danger)' : 'var(--c-success)' }}>
                                    EUR {((invoice.total || 0) - payments.reduce((sum, p) => sum + (p.amount || 0), 0))
                                        .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                        </Card>
                    </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                            <Card style={{ padding: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{t("jobCards.invoiceTab.subTotalAmount")}</span>
                                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
                                    EUR {invoice.subtotal?.toLocaleString() || '0.00'}
                                </div>
                            </Card>
                            <Card style={{ padding: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{t("jobCards.invoiceTab.discountPercentage")}</span>
                                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: 'var(--c-success)' }}>
                                    {invoice.discount?.toLocaleString() || '0.00'} % 
                                </div>
                            </Card>
                            <Card style={{ padding: '20px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--c-muted)', textTransform: 'uppercase' }}>{t("jobCards.invoiceTab.taxPercentage")}</span>
                                <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px', color: invoice.balance > 0 ? 'var(--c-danger)' : 'var(--c-success)' }}>
                                    {invoice.tax?.toLocaleString() || '0.00'} %
                                </div>
                            </Card>
                        </div>
                    <Card style={{ overflow: 'hidden' }}>
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <History size={18} style={{ color: 'var(--c-muted)' }} />
                                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>{t("jobCards.invoiceTab.paymentHistory")}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                {canPrintInvoice && (
                                    <Button variant="secondary" size="sm" onClick={handlePrintInvoice}>
                                        <Printer size={16} style={{ marginRight: '6px' }} />
                                        {t("jobCards.invoiceTab.printInvoice")}
                                    </Button>
                                )}
                                <Button size="sm" onClick={handleAddPaymentModal} disabled={invoice.balance <= 0}>
                                    <Plus size={16} style={{ marginRight: '6px' }} />
                                    {t("jobCards.invoiceTab.addPayment")}
                                </Button>
                            </div>
                        </div>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--c-bg-subtle)', borderBottom: '1px solid var(--c-border)' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t("jobCards.invoiceTab.date")}</th>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t("jobCards.invoiceTab.methodCol")}</th>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t("jobCards.invoiceTab.notesCol")}</th>
                                    <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t("jobCards.invoiceTab.amountCol")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-muted)' }}>{t("jobCards.invoiceTab.noPayments")}</td>
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
                                {t("jobCards.invoiceTab.page")} {page} {t("jobCards.invoiceTab.of")} {totalPages}
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
