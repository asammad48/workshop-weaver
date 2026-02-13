import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { auditRepo } from '@/api/repositories/auditRepo';
import { AuditLogResponse } from '@/api/generated/apiClient';
import { Select } from '@/components/forms/Select';
import { getBranchesOnce, getBranchMap } from '@/api/lookups/branchesLookup';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  FileText,
  Clock,
  User,
  Activity,
  Box,
  Hash,
  MessageSquare
} from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [branchId, setBranchId] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [branches, setBranches] = useState<{value: string, label: string}[]>([]);
  const pageSize = 15;

  const fetchLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await auditRepo.list(
        page, 
        pageSize, 
        search || undefined, 
        'OccurredAt', 
        'Desc', 
        branchId || undefined
      );
      if (response.success && response.data?.items) {
        setLogs(response.data.items);
        setTotalItems(response.data.totalCount || 0);
      } else {
        setError(response.message || 'Failed to load audit logs');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    try {
      const branchList = await getBranchesOnce();
      setBranches(branchList.map(b => ({ value: b.id!, label: b.name! })));
    } catch (err) {
      console.error('Failed to load branches', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, search, branchId]);

  useEffect(() => {
    loadBranches();
  }, []);

  const branchMap = useMemo(() => getBranchMap(), [branches]);
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Audit Log</h1>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 2, minWidth: '200px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder="Search by action, email or message..." 
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Select 
              options={[{ value: '', label: 'All Branches' }, ...branches]}
              value={branchId}
              onChange={(e) => {
                setBranchId(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={14} /> Time</div>
                </th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><User size={14} /> Actor</div>
                </th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Activity size={14} /> Action</div>
                </th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Box size={14} /> Entity</div>
                </th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><MessageSquare size={14} /> Message</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    {error}
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    <FileText size={48} style={{ marginBottom: '16px', opacity: 0.2, margin: '0 auto' }} />
                    <p>No audit entries found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px', fontSize: '14px', whiteSpace: 'nowrap' }}>
                      {log.occurredAt ? new Date(log.occurredAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      <div style={{ fontWeight: 500 }}>{log.actorEmail}</div>
                      {log.branchId && (
                        <div style={{ fontSize: '12px', color: 'var(--c-muted)' }}>
                          {branchMap[log.branchId]?.name || 'Unknown Branch'}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        fontSize: '12px', 
                        padding: '2px 8px', 
                        borderRadius: '12px', 
                        background: 'var(--c-bg-alt)', 
                        border: '1px solid var(--c-border)',
                        textTransform: 'capitalize'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px' }}>
                      <div style={{ color: 'var(--c-muted)', fontSize: '12px' }}>{log.entityType}</div>
                      <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>{log.entityId}</div>
                    </td>
                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--c-text)' }}>
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={{ padding: '16px', borderTop: '1px solid var(--c-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--c-muted)' }}>
            Showing {logs.length} entries (Page {page} of {totalPages})
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
}
