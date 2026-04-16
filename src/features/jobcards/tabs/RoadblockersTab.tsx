import React, { useState, useEffect } from "react";
import { roadblockersRepo } from "@/api/repositories/roadblockersRepo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/forms/Select";
import { ModalContent } from "@/components/ui/Modal";
import { toast, openModal, closeModal, confirm } from "@/state/uiStore";
import { ROADBLOCKER_TYPE_LABELS, ROADBLOCKER_TYPE_OPTIONS, RoadblockerType } from "@/constants/enums";
import { Plus, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { useI18n } from "@/i18n";

interface RoadblockersTabProps {
  jobCardId: string;
}

const RoadblockerAddModalContent: React.FC<{ jobCardId: string; onAdded: () => void }> = ({ jobCardId, onAdded }) => {
  const [type, setType] = useState(RoadblockerType.PARTS);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!description) {
      toast.error('Description is required');
      return;
    }
    setLoading(true);
    try {
      await roadblockersRepo.create({
        jobCardId,
        type,
        description
      });
      toast.success("Roadblocker added");
      closeModal();
      onAdded();
    } catch (err) {
      toast.error("Failed to add roadblocker");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalContent
      footer={
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={closeModal} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} loading={loading}>Add Roadblocker</Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Select
          label="Type"
          options={ROADBLOCKER_TYPE_OPTIONS}
          value={type}
          onChange={(e) => setType(Number(e.target.value))}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', fontWeight: 500 }}>Description *</label>
          <textarea
            required
            rows={3}
            style={{ padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', resize: 'none' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>
    </ModalContent>
  );
};

export const RoadblockersTab: React.FC<RoadblockersTabProps> = ({ jobCardId }) => {
  const { t } = useI18n();
  const [roadblockers, setRoadblockers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

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

  const totalItems = roadblockers.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = roadblockers.slice((page - 1) * pageSize, page * pageSize);

  const handleAddModal = () => {
    openModal('Add Roadblocker', <RoadblockerAddModalContent jobCardId={jobCardId} onAdded={fetchData} />);
  };

  const handleResolve = async (id: string) => {
    const confirmed = await confirm({
      title: "Resolve Roadblocker",
      message: "Are you sure you want to mark this roadblocker as resolved?",
      confirmText: "Resolve"
    });

    if (confirmed) {
      try {
        await roadblockersRepo.resolve(id);
        toast.success("Roadblocker resolved");
        fetchData();
      } catch (err) {
        toast.error("Failed to resolve roadblocker");
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginTop: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleAddModal}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Roadblocker
        </Button>
      </div>

      <Card style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--c-bg-subtle)', borderBottom: '1px solid var(--c-border)' }}>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t('table.type')}</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t('table.description')}</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t('table.createdAt')}</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t('table.resolvedAt')}</th>
              <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t('table.status')}</th>
              <th style={{ textAlign: 'right', padding: '12px 20px', fontSize: '12px', fontWeight: 600, color: 'var(--c-muted)' }}>{t('table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                  <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                </td>
              </tr>
            ) : roadblockers.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--c-muted)' }}>No roadblockers found.</td>
              </tr>
            ) : (
              paginatedItems.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                  <td style={{ padding: '12px 20px', fontSize: '14px', fontWeight: 500 }}>
                    {ROADBLOCKER_TYPE_LABELS[r.type] || r.type}
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '14px' }}>{r.description}</td>
                  <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--c-muted)' }}>{r.createdAtLocal ? new Date(r.createdAtLocal).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '12px 20px', fontSize: '14px', color: 'var(--c-muted)' }}>{r.resolvedAt ? new Date(r.resolvedAt).toLocaleDateString() : '-'}</td>
                  <td style={{ padding: '12px 20px', fontSize: '14px' }}>
                    <span style={{ 
                      padding: '2px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      backgroundColor: r.isResolved ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                      color: r.isResolved ? 'rgb(34, 197, 94)' : 'rgb(234, 179, 8)'
                    }}>
                      {r.isResolved ? 'Resolved' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 20px', fontSize: '14px', textAlign: 'right' }}>
                    {!r.isResolved && (
                      <Button size="sm" variant="secondary" onClick={() => handleResolve(r.id)}>
                        Resolve
                      </Button>
                    )}
                  </td>
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
    </div>
  );
};
