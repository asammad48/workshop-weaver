import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/state/authStore';
import { authRepo } from '@/api/repositories/authRepo';
import '@/styles/global.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('admin@demo.com');
  const [password, setPassword] = useState('Admin@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authRepo.login({ email, password });
      setAuth(response.token, response.user);
      toast.success('Login successful!');
      navigate(from, { replace: true });
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pageCenter">
      <Card style={{ width: '100%', maxWidth: 400 }}>
        <CardHeader>
          <h2 style={{ margin: 0 }}>Workshop Management</h2>
          <p className="muted" style={{ margin: '4px 0 0 0' }}>
            Sign in to your account
          </p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="stack">
            <Input
              label="Email"
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@demo.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            {error && (
              <p style={{ color: 'var(--color-danger)', margin: 0, fontSize: 13 }}>
                {error}
              </p>
            )}
            <Button type="submit" disabled={loading} block>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
