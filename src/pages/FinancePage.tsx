import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { financeRepo } from '@/api/repositories/financeRepo';
import { 
  ExpenseResponse, 
  ExpenseCreateRequest, 
  WagePayResponse, 
  WagePayRequest,
  ExpenseCategory
} from '@/api/generated/apiClient';
import { useUIStore, toast, closeModal, openModal } from '@/state/uiStore';
import { ModalContent } from '@/components/ui/Modal';
import { Select } from '@/components/forms/Select';
import { 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Receipt,
  Banknote,
  Calendar,
  DollarSign
} from 'lucide-react';
import { getBranchesOnce } from '@/api/lookups/branchesLookup';
import { getUsersOnce } from '@/api/lookups/usersLookup';

type Tab = 'expenses' | 'wages';

const EXPENSE_CATEGORY_OPTIONS = [
  { value: ExpenseCategory._1.toString(), label: 'Category 1' },
  { value: ExpenseCategory._2.toString(), label: 'Category 2' },
  { value: ExpenseCategory._3.toString(), label: 'Category 3' },
  { value: ExpenseCategory._4.toString(), label: 'Category 4' },
  { value: ExpenseCategory._5.toString(), label: 'Category 5' },
  { value: ExpenseCategory._99.toString(), label: 'Other' },
];

const CATEGORY_LABELS: Record<number, string> = {
  [ExpenseCategory._1]: 'Category 1',
  [ExpenseCategory._2]: 'Category 2',
  [ExpenseCategory._3]: 'Category 3',
  [ExpenseCategory._4]: 'Category 4',
  [ExpenseCategory._5]: 'Category 5',
  [ExpenseCategory._99]: 'Other',
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>('expenses');

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Finance</h1>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--c-border)' }}>
        <button
          onClick={() => setActiveTab('expenses')}
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: activeTab === 'expenses' ? 'var(--c-primary)' : 'var(--c-muted)',
            borderBottom: activeTab === 'expenses' ? '2px solid var(--c-primary)' : 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('wages')}
          style={{
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: activeTab === 'wages' ? 'var(--c-primary)' : 'var(--c-muted)',
            borderBottom: activeTab === 'wages' ? '2px solid var(--c-primary)' : 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Wages
        </button>
      </div>

      {activeTab === 'expenses' ? <ExpensesTab /> : <WagesTab />}
    </div>
  );
}

function ExpensesTab() {
  const [items, setItems] = useState<ExpenseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financeRepo.listExpenses(page, pageSize, search);
      if (response.success && response.data?.items) {
        setItems(response.data.items);
        setTotalPages(Math.ceil((response.data.totalCount || 0) / pageSize) || 1);
      } else {
        setError(response.message || 'Failed to load expenses');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, search]);

  const handleCreate = () => {
    let date = new Date().toISOString().split('T')[0];
    let category = ExpenseCategory._1;
    let amount = 0;
    let description = '';

    openModal('Add Expense', (
      <ModalContent
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={async () => {
              if (!date || !category || !amount) {
                toast.error('Please fill required fields');
                return;
              }
              try {
                const res = await financeRepo.createExpense(new ExpenseCreateRequest({
                  expenseAt: new Date(date),
                  category: category as any,
                  amount,
                  description
                }));
                if (res.success) {
                  toast.success('Expense added successfully');
                  closeModal();
                  fetchItems();
                } else {
                  toast.error(res.message || 'Failed to add expense');
                }
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Add</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input label="Date" type="date" required defaultValue={date} onChange={(e) => date = e.target.value} />
          <Select 
            label="Category" 
            options={EXPENSE_CATEGORY_OPTIONS} 
            defaultValue={category}
            onChange={(e) => category = Number(e.target.value)} 
            required 
          />
          <Input label="Amount" type="number" required onChange={(e) => amount = Number(e.target.value)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Notes</label>
            <textarea 
              style={{ 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid var(--c-border)',
                background: 'var(--c-bg)',
                color: 'var(--c-text)',
                minHeight: '80px'
              }}
              onChange={(e) => description = e.target.value} 
            />
          </div>
        </div>
      </ModalContent>
    ));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <Button onClick={handleCreate}>
          <Plus size={18} style={{ marginRight: '8px' }} />
          Add Expense
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder="Search expenses..." 
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
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Category</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Amount</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Notes</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No expenses found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px' }}>{item.expenseAt ? new Date(item.expenseAt).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}>
                        {item.category !== undefined ? CATEGORY_LABELS[item.category as unknown as number] || item.category : '—'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{item.amount?.toLocaleString()}</td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>{item.description || '—'}</td>
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
    </>
  );
}

function WagesTab() {
  const [items, setItems] = useState<WagePayResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [branches, setBranches] = useState<{value: string, label: string}[]>([]);
  const [users, setUsers] = useState<{value: string, label: string}[]>([]);
  const pageSize = 10;

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await financeRepo.listWages(page, pageSize, search);
      if (response.success && response.data?.items) {
        setItems(response.data.items);
        setTotalPages(Math.ceil((response.data.totalCount || 0) / pageSize) || 1);
      } else {
        setError(response.message || 'Failed to load wages');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadLookups = async () => {
    const [branchList, userList] = await Promise.all([
      getBranchesOnce(),
      getUsersOnce()
    ]);
    setBranches(branchList.map(b => ({ value: b.id, label: b.name })));
    setUsers(userList.map(u => ({ value: u.id!, label: u.email || 'Unknown User' })));
  };

  useEffect(() => {
    fetchItems();
    loadLookups();
  }, [page, search]);

  const handlePay = () => {
    let employeeUserId = '';
    let amount = 0;
    let periodStart = new Date().toISOString().split('T')[0];
    let periodEnd = new Date().toISOString().split('T')[0];
    let notes = '';

    openModal('Pay Wage', (
      <ModalContent
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
            <Button onClick={async () => {
              if (!employeeUserId || !amount || !periodStart || !periodEnd) {
                toast.error('Please fill required fields');
                return;
              }
              try {
                const res = await financeRepo.payWage(new WagePayRequest({
                  employeeUserId,
                  amount,
                  periodStart: new Date(periodStart),
                  periodEnd: new Date(periodEnd),
                  notes
                }));
                if (res.success) {
                  toast.success('Wage paid successfully');
                  closeModal();
                  fetchItems();
                } else {
                  toast.error(res.message || 'Failed to pay wage');
                }
              } catch (err: any) {
                toast.error(err.message);
              }
            }}>Pay</Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select 
            label="Staff (User)" 
            options={users} 
            placeholder="Select staff member" 
            required 
            onChange={(e) => employeeUserId = e.target.value} 
          />
          <Input label="Amount" type="number" required onChange={(e) => amount = Number(e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <Input label="Period Start" type="date" required defaultValue={periodStart} onChange={(e) => periodStart = e.target.value} />
            <Input label="Period End" type="date" required defaultValue={periodEnd} onChange={(e) => periodEnd = e.target.value} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '14px', fontWeight: 500 }}>Notes</label>
            <textarea 
              style={{ 
                padding: '8px 12px', 
                borderRadius: '4px', 
                border: '1px solid var(--c-border)',
                background: 'var(--c-bg)',
                color: 'var(--c-text)',
                minHeight: '80px'
              }}
              onChange={(e) => notes = e.target.value} 
            />
          </div>
        </div>
      </ModalContent>
    ));
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
        <Button onClick={handlePay}>
          <Banknote size={18} style={{ marginRight: '8px' }} />
          Pay Wage
        </Button>
      </div>

      <Card style={{ marginBottom: '24px' }}>
        <div style={{ padding: '16px', display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--c-muted)' }} />
            <Input 
              placeholder="Search wages..." 
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
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Employee ID</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Amount</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Paid At</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Period</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Notes</th>
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
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    No wages found
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                    <td style={{ padding: '16px' }}>{item.employeeUserId || '—'}</td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{item.amount?.toLocaleString()}</td>
                    <td style={{ padding: '16px' }}>{item.paidAt ? new Date(item.paidAt).toLocaleString() : '—'}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '12px', color: 'var(--c-muted)' }}>
                        {item.periodStart ? new Date(item.periodStart).toLocaleDateString() : '?'} - {item.periodEnd ? new Date(item.periodEnd).toLocaleDateString() : '?'}
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>{item.notes || '—'}</td>
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
    </>
  );
}
