import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notificationsRepo } from '@/api/repositories/notificationsRepo';
import { NotificationResponse } from '@/api/generated/apiClient';
import { toast } from '@/state/uiStore';
import {
  Bell,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox
} from 'lucide-react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await notificationsRepo.list({ pageNumber: page, pageSize });
      setNotifications(response.items || []);
      setTotalItems(response.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsRepo.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      toast.success('Marked as read');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleOpen = (n: NotificationResponse) => {
    if (!n.isRead && n.id) {
      handleMarkRead(n.id);
    }
    if (n.refType === 'JOB_CARD' && n.refId) {
      navigate(`/jobcards/${n.refId}`);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, color: 'var(--c-text)' }}>Notifications</h1>
      </div>

      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--c-border)', textAlign: 'left' }}>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Type</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Title</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Message</th>
                <th style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Date</th>
                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--c-muted)', fontSize: '14px', fontWeight: 500 }}>Actions</th>
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
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--c-muted)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Inbox size={48} strokeWidth={1} />
                      <span>No notifications found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} style={{
                    borderBottom: '1px solid var(--c-border)',
                    backgroundColor: n.isRead ? 'transparent' : 'var(--c-primary-soft)'
                  }}>
                    <td style={{ padding: '16px' }}>
                      <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--c-bg-alt)', border: '1px solid var(--c-border)' }}>
                        {n.type}
                      </span>
                    </td>
                    <td style={{ padding: '16px', fontWeight: n.isRead ? 400 : 600 }}>{n.title}</td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>{n.message}</td>
                    <td style={{ padding: '16px', color: 'var(--c-muted)', fontSize: '14px' }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString() : '—'}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {!n.isRead && (
                          <Button variant="secondary" size="sm" onClick={() => handleMarkRead(n.id!)} title="Mark as read">
                            <Check size={16} />
                          </Button>
                        )}
                        {n.refType === 'JOB_CARD' && (
                          <Button variant="secondary" size="sm" onClick={() => handleOpen(n)} title="Open Job Card">
                            <ExternalLink size={16} />
                          </Button>
                        )}
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
