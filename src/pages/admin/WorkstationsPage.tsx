import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { workstationsRepo } from '@/api/repositories/workstationsRepo';
import { WorkStationResponse, WorkStationCreateRequest } from '@/api/generated/apiClient';
import { toast, openModal, closeModal } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { Select } from '@/components/forms/Select';
import { getBranchesOnce } from '@/api/lookups/branchesLookup';
import { 
  Plus, 
  Search, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Monitor,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function WorkstationsPage() {
  const [workstations, setWorkstations] = useState<WorkStationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [branches, setBranches] = useState<{value: string, label: string}[]>([]);
  const pageSize = 10;

  const fetchWorkstations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workstationsRepo.list(page, pageSize, search);
      if (response.success && response.data?.items) {
        setWorkstations(response.data.items);
        setTotalItems(response.data.totalCount || 0);
      } else {
        setError(response.message || 'Failed to load workstations');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    const branchList = await getBranchesOnce();
    setBranches(branchList.map(b => ({ value: b.id!, label: b.name! })));
  };

  useEffect(() => {
    fetchWorkstations();
    loadBranches();
  }, [page, search]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleCreateWorkstation = () => {
    let code = '';
    let name = '';
    
    openModal('Create Workstation', (
      <ModalContent
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={async () => {
              if (!code || !name) {
                toast.error('Code and Name are required');
                return;
              }
              try {
                const res = await workstationsRepo.create(new WorkStationCreateRequest({
                  code,
                  name
                }));
                if (res.success) {
                  toast.success('Workstation created successfully');
                  closeModal();
                  setPage(1);
                  fetchWorkstations();
                } else {
                  toast.error(res.message || 'Failed to create workstation');
                }
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Create</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Code" required onChange={(e) => code = e.target.value} />
          <Input label="Name" required onChange={(e) => name = e.target.value} />
        </div>
      </ModalContent>
    ));
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Workstations</h1>
        <Button onClick={handleCreateWorkstation}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create Workstation
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder="Search workstations..." 
              style={{ paddingLeft: '40px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </Card>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Code</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    {error}
                  </td>
                </tr>
              ) : workstations.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No workstations found
                  </td>
                </tr>
              ) : (
                workstations.map((ws) => (
                  <tr key={ws.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px' }}>{ws.code}</td>
                    <td style={{ padding: '16px' }}>{ws.name}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        color: !ws.isActive ? 'var(--c-danger)' : 'var(--c-success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px'
                      }}>
                        {ws.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {ws.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => {
                          openModal(`Workstation: ${ws.name}`, (
                            <ModalContent footer={<Button variant="secondary" onClick={closeModal}>Close</Button>}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-muted)' }}>Code</label>
                                  <div style={{ fontWeight: 500 }}>{ws.code}</div>
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-muted)' }}>Name</label>
                                  <div style={{ fontWeight: 500 }}>{ws.name}</div>
                                </div>
                                <div>
                                  <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-muted)' }}>Status</label>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: ws.isActive ? 'var(--c-success)' : 'var(--c-danger)' }}>
                                    {ws.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                                    {ws.isActive ? 'Active' : 'Inactive'}
                                  </div>
                                </div>
                              </div>
                            </ModalContent>
                          ))
                        }} title="View Workstation">
                          <Monitor size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

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
}
