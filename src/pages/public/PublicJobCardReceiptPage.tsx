import React from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { publicReceiptRepo } from "@/api/repositories/publicReceiptRepo";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Printer, Loader2, AlertCircle, Receipt } from "lucide-react";

const PublicJobCardReceiptPage: React.FC = () => {
    const { jobCardId } = useParams<{ jobCardId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("t") || undefined;

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["publicReceipt", jobCardId, token],
        queryFn: () => publicReceiptRepo.get(jobCardId!, token),
        enabled: !!jobCardId,
    });

    const receipt = data?.data;

    const handlePrint = () => {
        if (jobCardId) {
            publicReceiptRepo.openPrint(jobCardId, token);
        }
    };

    if (isLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "var(--c-bg)" }}>
                <Loader2 size={48} className="animate-spin" style={{ color: "var(--c-primary)" }} />
            </div>
        );
    }

    if (isError || !receipt) {
        return (
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "var(--c-bg)", padding: "20px", textAlign: "center" }}>
                <AlertCircle size={64} style={{ color: "var(--c-danger)", marginBottom: "16px" }} />
                <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "8px" }}>Receipt Not Found</h1>
                <p style={{ color: "var(--c-muted)", maxWidth: "400px" }}>
                    {(error as any)?.message || "The receipt you are looking for could not be found or the link has expired."}
                </p>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "var(--c-bg)", padding: "20px" }}>
            <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" }}>
                    <div>
                        <h1 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>{receipt.branchName || "Branch Name"}</h1>
                        <p style={{ color: "var(--c-muted)", marginTop: "4px", fontSize: "16px" }}>
                            Plate: <span style={{ fontWeight: 600, color: "var(--c-text)" }}>{receipt.plate}</span>
                        </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <span style={{
                            padding: "6px 12px",
                            borderRadius: "99px",
                            fontSize: "14px",
                            fontWeight: 600,
                            backgroundColor: "rgba(59, 130, 246, 0.1)",
                            color: "rgb(59, 130, 246)"
                        }}>
                            {receipt.status}
                        </span>
                        <div style={{ marginTop: "12px" }}>
                            <Button onClick={handlePrint}>
                                <Printer size={18} style={{ marginRight: "8px" }} />
                                Print Receipt PDF
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Summary Cards */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "16px", marginBottom: "24px" }}>
                    <Card style={{ padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--c-muted)", textTransform: "uppercase" }}>Entry At</span>
                        <div style={{ fontWeight: 600, marginTop: "4px" }}>{receipt.entryAt ? new Date(receipt.entryAt).toLocaleDateString() : "-"}</div>
                    </Card>
                    <Card style={{ padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--c-muted)", textTransform: "uppercase" }}>Exit At</span>
                        <div style={{ fontWeight: 600, marginTop: "4px" }}>{receipt.exitAt ? new Date(receipt.exitAt).toLocaleDateString() : "-"}</div>
                    </Card>
                    <Card style={{ padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--c-muted)", textTransform: "uppercase" }}>Total</span>
                        <div style={{ fontWeight: 700, marginTop: "4px" }}>EUR {receipt.invoice?.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </Card>
                    <Card style={{ padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--c-muted)", textTransform: "uppercase" }}>Paid</span>
                        <div style={{ fontWeight: 700, marginTop: "4px", color: "var(--c-success)" }}>EUR {receipt.invoice?.paid?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                    </Card>
                    <Card style={{ padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--c-muted)", textTransform: "uppercase" }}>Due</span>
                        <div style={{ fontWeight: 700, marginTop: "4px", color: (receipt.invoice?.due || 0) > 0 ? "var(--c-danger)" : "var(--c-success)" }}>
                            EUR {receipt.invoice?.due?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                    </Card>
                    <Card style={{ padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--c-muted)", textTransform: "uppercase" }}>Requested ETA</span>
                        <div style={{ fontWeight: 600, marginTop: "4px" }}>{receipt.entryAt ? new Date(receipt.requestedEta).toLocaleDateString() : "-"}</div>
                    </Card>
                    <Card style={{ padding: "16px" }}>
                        <span style={{ fontSize: "12px", color: "var(--c-muted)", textTransform: "uppercase" }}>Estimated ETA</span>
                        <div style={{ fontWeight: 600, marginTop: "4px" }}>{receipt.entryAt ? new Date(receipt.latestEstimatedEta).toLocaleDateString() : "-"}</div>
                    </Card>
                </div>

                {/* Invoice Lines */}
                {receipt.invoice?.hasInvoice && (
                    <Card style={{ marginBottom: "24px", overflow: "hidden" }}>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Receipt size={18} style={{ color: "var(--c-muted)" }} />
                            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Invoice Details</h3>
                        </div>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ backgroundColor: "var(--c-bg-subtle)", borderBottom: "1px solid var(--c-border)" }}>
                                    <th style={{ textAlign: "left", padding: "12px 20px", fontSize: "12px", fontWeight: 600, color: "var(--c-muted)" }}>Description</th>
                                    <th style={{ textAlign: "center", padding: "12px 20px", fontSize: "12px", fontWeight: 600, color: "var(--c-muted)" }}>Qty</th>
                                    <th style={{ textAlign: "right", padding: "12px 20px", fontSize: "12px", fontWeight: 600, color: "var(--c-muted)" }}>Unit Price</th>
                                    <th style={{ textAlign: "right", padding: "12px 20px", fontSize: "12px", fontWeight: 600, color: "var(--c-muted)" }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {receipt.invoice.lines?.map((line, idx) => (
                                    <tr key={idx} style={{ borderBottom: "1px solid var(--c-border)" }}>
                                        <td style={{ padding: "12px 20px", fontSize: "14px" }}>{line.name}</td>
                                        <td style={{ padding: "12px 20px", fontSize: "14px", textAlign: "center" }}>{line.qty}</td>
                                        <td style={{ padding: "12px 20px", fontSize: "14px", textAlign: "right" }}>EUR {line.unitPrice?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td style={{ padding: "12px 20px", fontSize: "14px", fontWeight: 500, textAlign: "right" }}>EUR {line.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <div style={{ padding: "20px", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "8px" }}>
                            <div style={{ display: "flex", gap: "40px", fontSize: "14px" }}>
                                <span style={{ color: "var(--c-muted)" }}>Subtotal</span>
                                <span style={{ fontWeight: 500 }}>EUR {receipt.invoice.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                            {receipt.invoice.discount > 0 && (
                                <div style={{ display: "flex", gap: "40px", fontSize: "14px" }}>
                                    <span style={{ color: "var(--c-muted)" }}>Discount</span>
                                    <span style={{ color: "var(--c-danger)" }}>- EUR {receipt.invoice.discount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            {receipt.invoice.tax > 0 && (
                                <div style={{ display: "flex", gap: "40px", fontSize: "14px" }}>
                                    <span style={{ color: "var(--c-muted)" }}>Tax</span>
                                    <span style={{ fontWeight: 500 }}>EUR {receipt.invoice.tax?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                            )}
                            <div style={{ display: "flex", gap: "40px", fontSize: "18px", fontWeight: 700, borderTop: "2px solid var(--c-border)", paddingTop: "8px", marginTop: "4px" }}>
                                <span>Total</span>
                                <span>EUR {receipt.invoice.total?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* Payments & Communications */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    <Card>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Payments</h3>
                        </div>
                        <div style={{ padding: "0" }}>
                            {receipt.payments && receipt.payments.length > 0 ? (
                                receipt.payments.map((p, idx) => (
                                    <div key={idx} style={{ padding: "12px 20px", borderBottom: idx < receipt.payments!.length - 1 ? "1px solid var(--c-border)" : "none", display: "flex", justifyContent: "space-between" }}>
                                        <div>
                                            <div style={{ fontSize: "14px", fontWeight: 500 }}>{p.method}</div>
                                            <div style={{ fontSize: "12px", color: "var(--c-muted)" }}>{p.paidAt ? new Date(p.paidAt).toLocaleString() : "-"}</div>
                                        </div>
                                        <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--c-success)" }}>
                                            EUR {p.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "20px", textAlign: "center", color: "var(--c-muted)", fontSize: "14px" }}>No payments recorded.</div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--c-border)" }}>
                            <h3 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>Service Log</h3>
                        </div>
                        <div style={{ padding: "0" }}>
                            {receipt.communications && receipt.communications.length > 0 ? (
                                receipt.communications.map((c, idx) => (
                                    <div key={idx} style={{ padding: "12px 20px", borderBottom: idx < receipt.communications!.length - 1 ? "1px solid var(--c-border)" : "none" }}>
                                        <div style={{ fontSize: "12px", color: "var(--c-muted)", marginBottom: "4px" }}>{c.occurredAt ? new Date(c.occurredAt).toLocaleString() : "-"}</div>
                                        <div style={{ fontSize: "14px" }}>{c.summary}</div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: "20px", textAlign: "center", color: "var(--c-muted)", fontSize: "14px" }}>No activity logged.</div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default PublicJobCardReceiptPage;
