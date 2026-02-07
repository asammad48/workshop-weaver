import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { branchesRepo } from '@/api/repositories/branchesRepo';
import { BranchResponse, BranchCreateRequest } from '@/api/generated/apiClient';
import { toast, openModal, closeModal } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { 
  Plus, 
  Search, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function BranchesPage() {
  const [branches, setBranches] = useState<BranchResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  const fetchBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await branchesRepo.list(page, pageSize, search);
      if (response.success && response.data?.items) {
        setBranches(response.data.items);
        setTotalItems(response.data.totalCount || 0);
      } else {
        setError(response.message || 'Failed to load branches');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, search]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleCreateBranch = () => {
    let name = '';
    let address = '';
    let isActive = true;

    openModal('Create Branch', (
      <ModalContent
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={async () => {
              if (!name) {
                toast.error('Name is required');
                return;
              }
              try {
                const res = await branchesRepo.create(new BranchCreateRequest({
                  name,
                  address,
                  isActive
                } as any));
                if (res.success) {
                  toast.success('Branch created successfully');
                  closeModal();
                  setPage(1);
                  fetchBranches();
                } else {
                  toast.error(res.message || 'Failed to create branch');
                }
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Create</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Name" required onChange={(e) => name = e.target.value} />
          <Input label="Address" onChange={(e) => address = e.target.value} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="isActive" 
              defaultChecked={isActive} 
              onChange={(e) => isActive = e.target.checked} 
            />
            <label htmlFor="isActive" style={{ fontSize: '14px' }}>Active</label>
          </div>
        </div>
      </ModalContent>
    ));
  };

  const handleViewBranch = async (id: string) => {
    try {
      const res = await branchesRepo.get(id);
      if (res.success && res.data) {
        const branch = res.data;
        openModal(`Branch Details: ${branch.name}`, (
          <ModalContent
            footer={<Button variant="secondary" onClick={closeModal}>Close</Button>}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-muted)' }}>Name</label>
                <div style={{ fontWeight: 500 }}>{branch.name}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-muted)' }}>Address</label>
                <div style={{ fontWeight: 500 }}>{branch.address || '—'}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: 'var(--c-muted)' }}>Status</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: branch.isActive ? 'var(--c-success)' : 'var(--c-danger)' }}>
                  {branch.isActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                  {branch.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          </ModalContent>
        ));
      } else {
        toast.error(res.message || 'Failed to load branch details');
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Branches</h1>
        <Button onClick={handleCreateBranch}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Create Branch
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder="Search branches..." 
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
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Name</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Address</th>
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
              ) : branches.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No branches found
                  </td>
                </tr>
              ) : (
                branches.map((branch) => (
                  <tr key={branch.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px' }}>{branch.name}</td>
                    <td style={{ padding: '16px' }}>{branch.address || '—'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        color: !branch.isActive ? 'var(--c-danger)' : 'var(--c-success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px'
                      }}>
                        {branch.isActive ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleViewBranch(branch.id!)} title="View Branch">
                          <Eye size={16} />
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
