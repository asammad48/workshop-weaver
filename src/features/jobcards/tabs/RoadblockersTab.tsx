import React, { useState, useEffect } from "react";
import { roadblockersRepo } from "@/api/repositories/roadblockersRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ModalHost as Modal } from "@/components/ui/Modal";
import { ConfirmDialogHost as ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { toast } from "@/components/ui/Toast";
import { Plus, AlertTriangle, CheckCircle } from "lucide-react";

interface RoadblockersTabProps {
  jobCardId: string;
}

export const RoadblockersTab: React.FC<RoadblockersTabProps> = ({ jobCardId }) => {
  const [roadblockers, setRoadblockers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isConfirmResolveOpen, setIsConfirmResolveOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await roadblockersRepo.listByJobCard(jobCardId);
      setRoadblockers(data || []);
    } catch (err) {
      toast.error("Failed to load roadblockers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [jobCardId]);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      jobCardId,
      type: formData.get("type") as string,
      description: formData.get("description") as string,
    };

    try {
      await roadblockersRepo.create(data);
      toast.success("Roadblocker added");
      setIsAddModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to add roadblocker");
    }
  };

  const handleResolve = async () => {
    if (!selectedId) return;
    try {
      await roadblockersRepo.resolve(selectedId);
      toast.success("Roadblocker resolved");
      setIsConfirmResolveOpen(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to resolve roadblocker");
    }
  };

  if (loading) return <div style={{ padding: '24px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Roadblocker
        </Button>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--c-bg-subtle)', borderBottom: '1px solid var(--c-border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Type</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Description</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Created</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Status</th>
              <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {roadblockers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-muted)' }}>No roadblockers found.</td>
              </tr>
            ) : (
              roadblockers.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 500 }}>{r.type}</td>
                  <td style={{ padding: '12px 20px', fontSize: '14px' }}>{r.description}</td>
                  <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--c-muted)' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 20px', fontSize: '14px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: r.resolvedAt ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: r.resolvedAt ? 'rgb(34, 197, 94)' : 'rgb(234, 179, 8)'
                    }}>
                      {r.resolvedAt ? 'Resolved' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '14px', textAlign: 'right' }}>
                    {!r.resolvedAt && (
                      <Button size="sm" variant="secondary" onClick={() => { setSelectedId(r.id); setIsConfirmResolveOpen(true); }}>
                        Resolve
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Roadblocker">
        <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Type *</label>
            <input name="type" required style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)' }} placeholder="e.g. Parts, Customer, Technical" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500 }}>Description *</label>
            <textarea name="description" required rows={3} style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Button type="button" variant="secondary" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Roadblocker</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={isConfirmResolveOpen}
        onClose={() => setIsConfirmResolveOpen(false)}
        onConfirm={handleResolve}
        title="Resolve Roadblocker"
        description="Are you sure you want to mark this roadblocker as resolved?"
      />
    </div>
  );
};
