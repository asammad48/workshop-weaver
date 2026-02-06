import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Plus, Shield, Power, UserPlus, Key } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/Table';
import { openModal, closeModal, toast, confirm } from '@/state/uiStore';
import { usersRepo, CreateUserDTO, UpdateUserDTO, User } from '@/api/repositories/usersRepo';
import { useAuthStore } from '@/state/authStore';

export default function UsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const isHqAdmin = currentUser?.role === 'HQ_ADMIN';

  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersRepo.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateUserDTO) => usersRepo.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to create user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) => usersRepo.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User updated successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to update user'),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password?: string }) => usersRepo.resetPassword(id, password),
    onSuccess: () => {
      toast.success('Password reset successfully');
      closeModal();
    },
    onError: () => toast.error('Failed to reset password'),
  });

  const handleCreate = () => {
    openModal('Create User', <UserForm onSubmit={(data) => createMutation.mutate(data)} isSubmitting={createMutation.isPending} />);
  };

  const handleEditRole = (user: User) => {
    openModal('Change Role', (
      <UserForm 
        initialData={user} 
        onSubmit={(data) => updateMutation.mutate({ id: user.id, data: { role: data.role } })} 
        isSubmitting={updateMutation.isPending}
        fields={['role']}
      />
    ));
  };

  const handleResetPassword = (user: User) => {
    openModal('Reset Password', (
      <ResetPasswordForm 
        onSubmit={(password) => resetPasswordMutation.mutate({ id: user.id, password })} 
        isSubmitting={resetPasswordMutation.isPending} 
      />
    ));
  };

  const handleToggleActive = async (user: User) => {
    const confirmed = await confirm({
      title: user.isActive ? 'Disable User' : 'Enable User',
      message: `Are you sure you want to ${user.isActive ? 'disable' : 'enable'} user ${user.email}?`,
      confirmText: user.isActive ? 'Disable' : 'Enable',
      danger: user.isActive,
    });

    if (confirmed) {
      updateMutation.mutate({ id: user.id, data: { isActive: !user.isActive } });
    }
  };

  const columns = [
    { header: 'Email', accessor: 'email' as keyof User },
    { 
      header: 'Role', 
      accessor: (u: User) => (
        <span className="badge badge-secondary">{u.role}</span>
      )
    },
    { header: 'Branch', accessor: 'branchId' as keyof User },
    { 
      header: 'Status', 
      accessor: (u: User) => (
        <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>
          {u.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: (u: User) => (
        <div className="row" style={{ gap: '8px' }}>
          {isHqAdmin && (
            <>
              <Button size="sm" variant="ghost" onClick={() => handleEditRole(u)} title="Change Role">
                <Shield size={16} />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleResetPassword(u)} title="Reset Password">
                <Key size={16} />
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => handleToggleActive(u)} 
                title={u.isActive ? 'Disable' : 'Enable'}
                style={{ color: u.isActive ? 'var(--c-danger)' : 'var(--c-success)' }}
              >
                <Power size={16} />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="stack">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)', margin: 0 }}>
          User Management
        </h1>
        {isHqAdmin && (
          <Button onClick={handleCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} />
            Add User
          </Button>
        )}
      </div>

      <Card>
        <Table 
          columns={columns} 
          data={users || []} 
          isLoading={isLoading}
          emptyMessage="No users found"
        />
      </Card>
    </div>
  );
}

interface UserFormProps {
  initialData?: Partial<User>;
  onSubmit: (data: CreateUserDTO) => void;
  isSubmitting: boolean;
  fields?: ('email' | 'role' | 'branchId' | 'password')[];
}

function UserForm({ initialData, onSubmit, isSubmitting, fields = ['email', 'role', 'branchId', 'password'] }: UserFormProps) {
  const [formData, setFormData] = useState<CreateUserDTO>({
    email: initialData?.email || '',
    role: initialData?.role || 'USER',
    branchId: initialData?.branchId || '',
    password: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="stack">
      {fields.includes('email') && (
        <Input 
          label="Email" 
          type="email" 
          required 
          value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
        />
      )}
      {fields.includes('role') && (
        <div className="input-wrapper">
          <label className="input-label">Role</label>
          <select 
            className="input" 
            value={formData.role} 
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--c-border)', backgroundColor: 'var(--c-card)', color: 'var(--c-text)' }}
          >
            <option value="USER">User</option>
            <option value="BRANCH_ADMIN">Branch Admin</option>
            <option value="HQ_ADMIN">HQ Admin</option>
          </select>
        </div>
      )}
      {fields.includes('branchId') && (
        <Input 
          label="Branch ID" 
          required 
          value={formData.branchId} 
          onChange={(e) => setFormData({ ...formData, branchId: e.target.value })} 
        />
      )}
      {fields.includes('password') && !initialData && (
        <Input 
          label="Password" 
          type="password" 
          required 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
        />
      )}
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '12px' }}>
        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save User'}
        </Button>
      </div>
    </form>
  );
}

function ResetPasswordForm({ onSubmit, isSubmitting }: { onSubmit: (password: string) => void; isSubmitting: boolean }) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <form onSubmit={handleSubmit} className="stack">
      <Input 
        label="New Password" 
        type="password" 
        required 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
      <div className="row" style={{ justifyContent: 'flex-end', marginTop: '16px', gap: '12px' }}>
        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
        <Button type="submit" variant="danger" disabled={isSubmitting}>
          {isSubmitting ? 'Resetting...' : 'Reset Password'}
        </Button>
      </div>
    </form>
  );
}
