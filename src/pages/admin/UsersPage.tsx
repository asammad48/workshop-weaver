import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { userRepo } from '@/api/repositories/userRepo';
import { UserDto, CreateUserDto, ResetPasswordDto, UpdateRoleDto } from '@/api/generated/apiClient';
import { useUIStore } from '@/state/uiStore';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';
import { ModalContent } from '@/components/ui/Modal';
import { 
  UserPlus, 
  Search, 
  UserCog, 
  Key, 
  Shield, 
  UserX, 
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

export default function UsersPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const openModal = useUIStore((s) => s.openModal);
  const closeModal = useUIStore((s) => s.closeModal);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userRepo.list(page, pageSize, search);
      if (response.success && response.data?.items) {
        setUsers(response.data.items);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setError(response.message || 'Failed to load users');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const handleCreateUser = () => {
    let formData = { email: '', password: '', role: 'User' };
    openModal({
      title: 'Create User',
      content: (
        <ModalContent
          footer={
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const res = await userRepo.create(new CreateUserDto(formData));
                  if (res.success) {
                    toast({ type: 'success', message: 'User created successfully' });
                    closeModal();
                    fetchUsers();
                  } else {
                    toast({ type: 'error', message: res.message || 'Failed to create user' });
                  }
                } catch (err: any) {
                  toast({ type: 'error', message: err.message });
                }
              }}>Create</Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Input label="Email" type="email" onChange={(e) => formData.email = e.target.value} />
            <Input label="Password" type="password" onChange={(e) => formData.password = e.target.value} />
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Role</label>
              <select 
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', background: 'var(--c-bg)' }}
                onChange={(e) => formData.role = e.target.value}
              >
                <option value="User">User</option>
                <option value="Admin">Admin</option>
                <option value="HQ_ADMIN">HQ Admin</option>
              </select>
            </div>
          </div>
        </ModalContent>
      )
    });
  };

  const handleResetPassword = (user: UserDto) => {
    let newPassword = '';
    openModal({
      title: `Reset Password for ${user.email}`,
      content: (
        <ModalContent
          footer={
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const res = await userRepo.setPassword(user.id!, new ResetPasswordDto({ newPassword }));
                  if (res.success) {
                    toast({ type: 'success', message: 'Password reset successfully' });
                    closeModal();
                  } else {
                    toast({ type: 'error', message: res.message || 'Failed to reset password' });
                  }
                } catch (err: any) {
                  toast({ type: 'error', message: err.message });
                }
              }}>Reset</Button>
            </div>
          }
        >
          <Input label="New Password" type="password" onChange={(e) => newPassword = e.target.value} />
        </ModalContent>
      )
    });
  };

  const handleUpdateRole = (user: UserDto) => {
    let role = user.role || 'User';
    openModal({
      title: `Update Role for ${user.email}`,
      content: (
        <ModalContent
          footer={
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button onClick={async () => {
                try {
                  const res = await userRepo.updateRole(user.id!, new UpdateRoleDto({ role }));
                  if (res.success) {
                    toast({ type: 'success', message: 'Role updated successfully' });
                    closeModal();
                    fetchUsers();
                  } else {
                    toast({ type: 'error', message: res.message || 'Failed to update role' });
                  }
                } catch (err: any) {
                  toast({ type: 'error', message: err.message });
                }
              }}>Update</Button>
            </div>
          }
        >
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Role</label>
            <select 
              defaultValue={role}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', background: 'var(--c-bg)' }}
              onChange={(e) => role = e.target.value}
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
              <option value="HQ_ADMIN">HQ Admin</option>
            </select>
          </div>
        </ModalContent>
      )
    });
  };

  const handleToggleStatus = async (user: UserDto) => {
    const isEnabled = !user.isDisabled;
    const action = isEnabled ? 'disable' : 'enable';
    
    const confirmed = await confirm({
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} User`,
      message: `Are you sure you want to ${action} ${user.email}?`,
      confirmText: action.charAt(0).toUpperCase() + action.slice(1),
      danger: isEnabled
    });

    if (confirmed) {
      try {
        const res = isEnabled ? await userRepo.disable(user.id!) : await userRepo.enable(user.id!);
        if (res.success) {
          toast({ type: 'success', message: `User ${action}d successfully` });
          fetchUsers();
        } else {
          toast({ type: 'error', message: res.message || `Failed to ${action} user` });
        }
      } catch (err: any) {
        toast({ type: 'error', message: err.message });
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
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px' }}>{user.email}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        color: user.isDisabled ? 'var(--c-danger)' : 'var(--c-success)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '14px'
                      }}>
                        {user.isDisabled ? <UserX size={14} /> : <UserCheck size={14} />}
                        {user.isDisabled ? 'Disabled' : 'Enabled'}
                      </span>
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
                          variant={user.isDisabled ? 'primary' : 'secondary'} 
                          size="sm" 
                          onClick={() => handleToggleStatus(user)}
                          title={user.isDisabled ? 'Enable' : 'Disable'}
                        >
                          {user.isDisabled ? <UserCheck size={16} /> : <UserX size={16} />}
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
