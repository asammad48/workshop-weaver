import { useState, useEffect, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { usersRepo } from '@/api/repositories/usersRepo';
import { UserDto, CreateUserDto, ResetPasswordDto, UpdateRoleDto } from '@/api/generated/apiClient';
import { useUIStore, toast, confirm, closeModal, openModal } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { Select } from '@/components/forms/Select';
import { USER_ROLE_LABELS, USER_ROLE_OPTIONS, UserRole, requireBranchForRole } from '@/constants/enums';
import { getBranchesOnce, getBranchMap } from '@/api/lookups/branchesLookup';
import { 
  UserPlus, 
  Search, 
  Key, 
  Shield, 
  UserX, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Eye
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [branches, setBranches] = useState<{value: string, label: string}[]>([]);
  const pageSize = 10;

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersRepo.list(page, pageSize, search);
      if (response.success && response.data?.items) {
        setUsers(response.data.items);
        setTotalItems(response.data.totalCount || 0);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async () => {
    const branchList = await getBranchesOnce();
    setBranches(branchList.map(b => ({ value: b.id, label: b.name })));
  };

  useEffect(() => {
    fetchUsers();
    loadBranches();
  }, [page, search]);

  const branchMap = useMemo(() => getBranchMap(), [branches]);
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const handleCreateUser = () => {
    let email = '';
    let password = '';
    let roleValue = UserRole.HQ_ADMIN;
    let branchId = '';
    let branchError = '';

    const renderModal = () => openModal('Create User', (
      <ModalContent
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={async () => {
              if (requireBranchForRole(roleValue) && !branchId) {
                branchError = 'Branch is required for this role';
                renderModal();
                return;
              }
              try {
                const res = await usersRepo.create(new CreateUserDto({
                  email,
                  password,
                  role: roleValue,
                  branchId: requireBranchForRole(roleValue) ? branchId : undefined
                }));
                if (res.success) {
                  toast.success('User created successfully');
                  closeModal();
                  fetchUsers();
                } else {
                  toast.error(res.message || 'Failed to create user');
                }
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Create</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Email" type="email" required onChange={(e) => email = e.target.value} />
          <Input label="Password" type="password" required placeholder="Min 8 characters" onChange={(e) => password = e.target.value} />
          <Select 
            label="Role"
            options={USER_ROLE_OPTIONS}
            defaultValue={roleValue}
            onChange={(e) => {
              roleValue = Number(e.target.value);
              branchError = '';
              renderModal();
            }}
          />
          {requireBranchForRole(roleValue) && (
            <Select 
              label="Branch"
              options={branches}
              placeholder="Select branch..."
              errorText={branchError}
              onChange={(e) => {
                branchId = e.target.value;
                branchError = '';
                renderModal();
              }}
            />
          )}
        </div>
      </ModalContent>
    ));

    renderModal();
  };

  const handleResetPassword = (user: UserDto) => {
    let newPassword = '';
    openModal(`Reset Password for ${user.email}`, (
      <ModalContent
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={async () => {
              if (newPassword.length < 8) {
                toast.error('Password must be at least 8 characters');
                return;
              }
              try {
                const res = await usersRepo.setPassword(user.id!, new ResetPasswordDto({ newPassword }));
                if (res.success) {
                  toast.success('Password reset successfully');
                  closeModal();
                } else {
                  toast.error(res.message || 'Failed to reset password');
                }
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Reset</Button>
          </div>
        }
      >
        <Input label="New Password" type="password" required placeholder="Min 8 characters" onChange={(e) => newPassword = e.target.value} />
      </ModalContent>
    ));
  };

  const handleUpdateRole = async (user: UserDto) => {
    let userData = user;
    try {
      const res = await usersRepo.get(user.id!);
      if (res.success && res.data) {
        userData = res.data;
      }
    } catch (err) {
      console.error('Failed to fetch latest user data', err);
    }

    let selectedRole = userData.role || UserRole.HQ_ADMIN;
    let selectedBranchId = userData.branchId || '';
    let branchError = '';

    const renderModal = () => openModal(`Update Role for ${user.email}`, (
      <ModalContent
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={async () => {
              if (requireBranchForRole(selectedRole) && !selectedBranchId) {
                branchError = 'Branch is required for this role';
                renderModal();
                return;
              }
              try {
                const res = await usersRepo.updateRole(user.id!, new UpdateRoleDto({ 
                  role: selectedRole,
                  branchId: requireBranchForRole(selectedRole) ? selectedBranchId : undefined
                } as any)); // Using any because UpdateRoleDto in apiClient might need branchId adding if missing from DTO
                if (res.success) {
                  toast.success('Role updated successfully');
                  closeModal();
                  fetchUsers();
                } else {
                  toast.error(res.message || 'Failed to update role');
                }
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Update</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select 
            label="Role"
            options={USER_ROLE_OPTIONS}
            defaultValue={selectedRole}
            onChange={(e) => {
              selectedRole = Number(e.target.value);
              branchError = '';
              renderModal();
            }}
          />
          {requireBranchForRole(selectedRole) && (
            <Select 
              label="Branch"
              options={branches}
              defaultValue={selectedBranchId}
              placeholder="Select branch..."
              errorText={branchError}
              onChange={(e) => {
                selectedBranchId = e.target.value;
                branchError = '';
                renderModal();
              }}
            />
          )}
        </div>
      </ModalContent>
    ));

    renderModal();
  };

  const handleToggleStatus = async (user: UserDto) => {
    const isCurrentlyActive = user.isActive;
    const action = isCurrentlyActive ? 'disable' : 'enable';
    
    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} ${user.email}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      danger: isCurrentlyActive
    });

    if (confirmed) {
      try {
        const res = isCurrentlyActive ? await usersRepo.disable(user.id!) : await usersRepo.enable(user.id!);
        if (res.success) {
          toast.success(`User ${action}d successfully`);
          fetchUsers();
        } else {
          toast.error(res.message || `Failed to ${action} user`);
        }
      } catch (err: any) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Users</h1>
        <Button onClick={handleCreateUser}>
          <UserPlus size={18} style={{ marginRight: '8px' }} />
          Create User
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder="Search users..." 
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
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Email</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Branch</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Active</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>CreatedAt</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center' }}>
                    <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--c-primary)' }} />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-danger)' }}>
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px' }}>{user.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}>
                        {user.role !== undefined ? USER_ROLE_LABELS[user.role] : 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      {user.branchId ? branchMap[user.branchId]?.name ?? user.branchName ?? '—' : '—'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        color: !user.isActive ? 'var(--c-danger)' : 'var(--c-success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px'
                      }}>
                        {!user.isActive ? <UserX size={14} /> : <UserCheck size={14} />}
                        {user.isActive ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <Button variant="secondary" size="sm" onClick={() => handleUpdateRole(user)} title="Update Role">
                          <Shield size={16} />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleResetPassword(user)} title="Reset Password">
                          <Key size={16} />
                        </Button>
                        <Button 
                          variant={!user.isActive ? 'primary' : 'secondary'} 
                          size="sm" 
                          onClick={() => handleToggleStatus(user)}
                          title={!user.isActive ? 'Enable' : 'Disable'}
                        >
                          {!user.isActive ? <UserCheck size={16} /> : <UserX size={16} />}
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
