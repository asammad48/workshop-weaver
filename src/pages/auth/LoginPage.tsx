import { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { useAuthStore } from '@/state/authStore';
import { authRepo, toUserMessage } from '@/api/repositories/authRepo';
import { useI18n } from '@/i18n';
import '@/styles/global.css';

// Demo user for offline/testing mode
const DEMO_USER = {
    id: 'demo-user-1',
    email: 'admin@demo.com',
    name: 'Demo Admin',
    role: 'admin',
};

export default function LoginPage() {
    const { t } = useI18n();
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
            setAuth(response.token, response.refreshToken, response.user);
            toast.success(t('auth.login.toast.success'));
            navigate(from, { replace: true });
        } catch (err) {
            // Fallback to demo mode if API is unavailable
            if (email === 'admin@demo.com' && password === 'Admin@123') {
                setAuth('demo-token-' + Date.now(), 'demo-refresh-' + Date.now(), DEMO_USER);
                toast.info(t('auth.login.toast.demoMode'));
                navigate(from, { replace: true });
                return;
            }

            const message = toUserMessage(err);
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
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '16px' }}>
                        <img src="/images/logo.png" alt="Logo" style={{ width: '80px', height: '80px', marginBottom: '16px', objectFit: 'contain' }} />
                        <h2 style={{ margin: 0 }}>{t('layout.brand.title')}</h2>
                    </div>
                    <p className="muted" style={{ margin: '4px 0 0 0', textAlign: 'center' }}>
                        {t('auth.login.subtitle')}
                    </p>
                </CardHeader>
                <CardBody>
                    <form onSubmit={handleSubmit} className="stack">
                        <Input
                            label={t('auth.login.emailLabel')}
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin@demo.com"
                            required
                        />
                        <Input
                            label={t('auth.login.passwordLabel')}
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        {error && (
                            <p style={{ color: 'var(--c-danger)', margin: 0, fontSize: 13 }}>
                                {error}
                            </p>
                        )}
                        <Button type="submit" disabled={loading} block>
                            {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
                        </Button>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
}
