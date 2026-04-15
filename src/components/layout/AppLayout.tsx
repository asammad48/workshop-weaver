import { ReactNode, useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LogOut, User as UserIcon, Bell, Check, ExternalLink } from 'lucide-react';
import { getNav } from '@/app/nav';
import { useAuthStore } from '@/state/authStore';
import { confirm } from '@/components/ui/ConfirmDialog';
import { toast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { notificationsRepo } from '@/api/repositories/notificationsRepo';
import { NotificationResponse } from '@/api/generated/apiClient';

interface AppLayoutProps {
    children: ReactNode;
}

const SIDEBAR_KEY = 'ui.sidebarCollapsed';
const APP_LANGUAGE_KEY = 'ui.appLanguage';

/**
 * Application layout with collapsible sidebar navigation and topbar
 */
export function AppLayout({ children }: AppLayoutProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();
    const [collapsed, setCollapsed] = useState(() => {
        return localStorage.getItem(SIDEBAR_KEY) === 'true';
    });
    const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem(APP_LANGUAGE_KEY) || 'en');
    const notificationRef = useRef<HTMLDivElement>(null);
    const notifiedIdsRef = useRef<Set<string>>(new Set());
    const hasBootstrappedNotificationsRef = useRef(false);
    const audioContextRef = useRef<AudioContext | null>(null);

    const navGroups = getNav(user?.role);

    const setGoogleTranslateCookie = (language: string) => {
        const googTransValue = `/auto/${language}`;
        document.cookie = `googtrans=${googTransValue}; path=/`;
        document.cookie = `googtrans=${googTransValue}; domain=${window.location.hostname}; path=/`;
    };

    const applyLanguageToGoogleTranslate = (language: string) => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
            combo.value = language;
            combo.dispatchEvent(new Event('change'));
        }
    };

    // Persist collapsed state
    useEffect(() => {
        localStorage.setItem(SIDEBAR_KEY, String(collapsed));
    }, [collapsed]);

    useEffect(() => {
        localStorage.setItem(APP_LANGUAGE_KEY, selectedLanguage);
        setGoogleTranslateCookie(selectedLanguage);
        applyLanguageToGoogleTranslate(selectedLanguage);
    }, [selectedLanguage]);

    useEffect(() => {
        // Re-apply selected language when route content changes in SPA.
        const timer = setTimeout(() => {
            applyLanguageToGoogleTranslate(selectedLanguage);
        }, 150);
        return () => clearTimeout(timer);
    }, [location.pathname, selectedLanguage]);

    useEffect(() => {
        const existingScript = document.getElementById('google-translate-script');
        const selected = localStorage.getItem(APP_LANGUAGE_KEY) || 'en';
        setGoogleTranslateCookie(selected);

        (window as any).googleTranslateElementInit = () => {
            if (!(window as any).google?.translate?.TranslateElement) return;
            new (window as any).google.translate.TranslateElement(
                {
                    pageLanguage: 'en',
                    includedLanguages: 'en,es',
                    autoDisplay: false,
                    layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
                },
                'google_translate_element'
            );

            setTimeout(() => applyLanguageToGoogleTranslate(selected), 250);
        };

        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'google-translate-script';
            script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
            script.async = true;
            document.body.appendChild(script);
        } else {
            setTimeout(() => applyLanguageToGoogleTranslate(selected), 250);
        }
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationsRepo.list({ unreadOnly: true, pageSize: 5 });
            const unreadItems = res.items || [];
            setNotifications(unreadItems);

            const unreadRes = await notificationsRepo.list({ unreadOnly: true, pageSize: 1 });
            setUnreadCount(unreadRes.totalCount || 0);

            const jobCardUnreadItems = unreadItems.filter(
                (n) => n.type === 'JOB_CARD' && !!n.id
            );

            if (!hasBootstrappedNotificationsRef.current) {
                notifiedIdsRef.current = new Set(jobCardUnreadItems.map((n) => n.id!));
                hasBootstrappedNotificationsRef.current = true;
                return;
            }

            for (const notification of jobCardUnreadItems) {
                if (!notification.id || notifiedIdsRef.current.has(notification.id)) {
                    continue;
                }
                notifiedIdsRef.current.add(notification.id);
                showJobCardToast(notification);
            }
        } catch (err) {
            console.error('Failed to fetch notifications', err);
        }
    };

    useEffect(() => {
        const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContextCtor) return;

        const ensureAudioContextReady = async () => {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContextCtor();
            }

            if (audioContextRef.current.state === 'suspended') {
                try {
                    await audioContextRef.current.resume();
                } catch (error) {
                    console.warn('Unable to resume audio context for notifications', error);
                }
            }

            // On some browsers, a tiny gesture-triggered tone helps unlock future playback.
            if (audioContextRef.current.state === 'running') {
                const oscillator = audioContextRef.current.createOscillator();
                const gainNode = audioContextRef.current.createGain();
                gainNode.gain.value = 0.00001;
                oscillator.connect(gainNode);
                gainNode.connect(audioContextRef.current.destination);
                oscillator.start();
                oscillator.stop(audioContextRef.current.currentTime + 0.01);
            }

            if (audioContextRef.current.state === 'running') {
                interactionEvents.forEach((eventName) => {
                    window.removeEventListener(eventName, ensureAudioContextReady);
                });
            }
        };

        const interactionEvents: Array<keyof WindowEventMap> = ['click', 'keydown', 'touchstart'];
        interactionEvents.forEach((eventName) => {
            window.addEventListener(eventName, ensureAudioContextReady);
        });

        return () => {
            interactionEvents.forEach((eventName) => {
                window.removeEventListener(eventName, ensureAudioContextReady);
            });
        };
    }, []);

    const beepNotification = async () => {
        try {
            const AudioContextCtor = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextCtor) return;

            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContextCtor();
            }
            const audioContext = audioContextRef.current;
            if (audioContext.state === 'suspended') {
                await audioContext.resume();
            }
            if (audioContext.state !== 'running') return;

            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0.0001, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.12, audioContext.currentTime + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.26);
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.27);
        } catch (error) {
            console.warn('Unable to play notification beep', error);
        }
    };

    const markNotificationAsRead = async (id: string) => {
        await notificationsRepo.markRead(id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
    };

    const showJobCardToast = (notification: NotificationResponse) => {
        const message = notification.message || notification.title || 'New job card notification';
        let handled = false;
        const resolveNotification = async () => {
            if (handled) return;
            handled = true;
            if (!notification.id) return;
            try {
                await markNotificationAsRead(notification.id);
            } catch (error) {
                console.error('Failed to mark notification as read', error);
            }
        };

        void beepNotification();
        toast.info(message, {
            durationMs: 15000,
            onClick: async () => {
                await resolveNotification();
                if (notification.refType === 'JOB_CARD' && notification.refId) {
                    navigate(`/jobcards/${notification.refId}`);
                }
            },
            onDismiss: resolveNotification,
        });
    };

    useEffect(() => {
        if (user) {
            fetchNotifications();
            const interval = setInterval(fetchNotifications, 10000); // refresh every 10 sec
            return () => clearInterval(interval);
        }
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkRead = async (id: string) => {
        try {
            await markNotificationAsRead(id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogout = async () => {
        const confirmed = await confirm({
            title: 'Logout',
            message: 'Are you sure you want to logout?',
            confirmText: 'Logout',
            danger: true,
        });

        if (confirmed) {
            logout();
            toast.info('Logged out successfully');
            navigate('/login');
        }
    };

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        if (location.pathname === path) return true;

        // Check if any other nav item is an exact match for the current location.
        // If another nav item matches exactly, this one (which is a prefix) shouldn't be active.
        const hasBetterMatch = navGroups.some(group =>
            group.items.some(item => item.path !== path && location.pathname === item.path)
        );

        if (hasBetterMatch) return false;

        return location.pathname.startsWith(path + '/');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100%', backgroundColor: 'var(--c-bg)' }}>
            {/* Sidebar */}
            <aside
                style={{
                    width: collapsed ? '64px' : '240px',
                    backgroundColor: 'var(--c-card)',
                    borderRight: '1px solid var(--c-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.2s ease',
                    overflow: 'hidden',
                    zIndex: 50,
                }}
            >
                {/* Sidebar Toggle / Header */}
                <div
                    style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--c-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: collapsed ? 'center' : 'space-between',
                        minHeight: '64px',
                    }}
                >
                    {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <img src="/images/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                            <span style={{ fontWeight: 700, fontSize: '14px', whiteSpace: 'nowrap' }}>Workshop</span>
                        </div>
                    )}
                    {collapsed && (
                        <img src="/images/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--c-muted)',
                            borderRadius: '4px',
                        }}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav style={{ flex: 1, overflow: 'auto', padding: '8px' }}>
                    {navGroups.map((group) => (
                        <div key={group.label} style={{ marginBottom: '16px' }}>
                            {!collapsed && (
                                <div
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 600,
                                        color: 'var(--c-muted)',
                                        textTransform: 'uppercase',
                                        padding: '8px 12px 4px',
                                        letterSpacing: '0.5px',
                                    }}
                                >
                                    {group.label}
                                </div>
                            )}
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        title={collapsed ? item.label : undefined}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: collapsed ? '10px' : '10px 12px',
                                            borderRadius: '6px',
                                            textDecoration: 'none',
                                            color: active ? 'var(--c-primary)' : 'var(--c-text)',
                                            backgroundColor: active ? 'var(--c-primary-soft)' : 'transparent',
                                            fontWeight: active ? 500 : 400,
                                            fontSize: '13px',
                                            marginBottom: '2px',
                                            justifyContent: collapsed ? 'center' : 'flex-start',
                                            transition: 'background-color 0.15s ease',
                                        }}
                                    >
                                        <Icon size={18} style={{ flexShrink: 0 }} />
                                        {!collapsed && (
                                            <span style={{ whiteSpace: 'nowrap' }}>
                                                {item.label}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Container */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Topbar */}
                <header
                    style={{
                        height: '64px',
                        backgroundColor: 'var(--c-card)',
                        borderBottom: '1px solid var(--c-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 24px',
                        zIndex: 40,
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src="/images/logo.png" alt="Logo" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                        <span style={{ fontWeight: 700, fontSize: '18px', color: 'var(--c-text)' }}>Workshop Management</span>
                        {user?.branchId && (
                            <span
                                style={{
                                    backgroundColor: 'var(--c-primary-soft)',
                                    color: 'var(--c-primary)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    padding: '2px 8px',
                                    borderRadius: '999px',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Branch: {user.branchId}
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div id="google_translate_element" style={{ display: 'none' }} />
                        <select
                            value={selectedLanguage}
                            onChange={(e) => setSelectedLanguage(e.target.value)}
                            style={{
                                border: '1px solid var(--c-border)',
                                borderRadius: '6px',
                                backgroundColor: 'var(--c-bg)',
                                color: 'var(--c-text)',
                                padding: '6px 10px',
                                fontSize: '13px',
                                cursor: 'pointer',
                            }}
                            title="Select language"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                        </select>
                        {/* Notifications Bell */}
                        <div style={{ position: 'relative' }} ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'var(--c-muted)',
                                    borderRadius: '50%',
                                    position: 'relative',
                                    transition: 'background-color 0.2s'
                                }}
                                className="hover-bg"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '4px',
                                        right: '4px',
                                        backgroundColor: 'var(--c-danger)',
                                        color: 'white',
                                        fontSize: '10px',
                                        fontWeight: 700,
                                        minWidth: '16px',
                                        height: '16px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '0 4px',
                                        border: '2px solid var(--c-card)'
                                    }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: 0,
                                    marginTop: '8px',
                                    width: '320px',
                                    backgroundColor: 'var(--c-card)',
                                    border: '1px solid var(--c-border)',
                                    borderRadius: '8px',
                                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                                    zIndex: 100,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--c-border)', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                                        <span>Notifications</span>
                                        <Link to="/notifications" style={{ fontSize: '12px', color: 'var(--c-primary)', textDecoration: 'none' }} onClick={() => setShowNotifications(false)}>View all</Link>
                                    </div>
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-muted)', fontSize: '13px' }}>
                                                No notifications
                                            </div>
                                        ) : (
                                            notifications.map(n => (
                                                <div
                                                    key={n.id}
                                                    style={{
                                                        padding: '12px 16px',
                                                        borderBottom: '1px solid var(--c-border)',
                                                        backgroundColor: n.isRead ? 'transparent' : 'var(--c-primary-soft)',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => {
                                                        if (n.refType === 'JOB_CARD' && n.refId) {
                                                            navigate(`/jobcards/${n.refId}`);
                                                            setShowNotifications(false);
                                                            if (!n.isRead && n.id) handleMarkRead(n.id);
                                                        }
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 600, fontSize: '13px', marginBottom: '2px', display: 'flex', justifyContent: 'space-between' }}>
                                                        {n.title}
                                                        {!n.isRead && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); if (n.id) handleMarkRead(n.id); }}
                                                                style={{ background: 'none', border: 'none', color: 'var(--c-primary)', cursor: 'pointer' }}
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <div style={{ fontSize: '12px', color: 'var(--c-muted)', lineHeight: '1.4' }}>{n.message}</div>
                                                    <div style={{ fontSize: '10px', color: 'var(--c-muted)', marginTop: '4px' }}>
                                                        {n.createdAt ? new Date(n.createdAt).toLocaleString() : ''}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--c-muted)', fontSize: '13px' }}>
                            <UserIcon size={16} />
                            <span>{user?.email}</span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--c-danger)' }}>
                            <LogOut size={16} />
                            <span>Logout</span>
                        </Button>
                    </div>
                </header>

                {/* Page Content */}
                <main style={{ flex: 1, overflow: 'auto' }}>
                    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
