import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';
import { useThemeStore } from '@/state/themeStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { useI18n } from '@/i18n';
import '@/styles/global.css';

export default function ThemePage() {
  const { t } = useI18n();
  const { primary, secondary, accent, setTheme, resetTheme } = useThemeStore();

  const [localPrimary, setLocalPrimary] = useState(primary);
  const [localSecondary, setLocalSecondary] = useState(secondary);
  const [localAccent, setLocalAccent] = useState(accent);

  const handleSave = () => {
    setTheme({
      primary: localPrimary,
      secondary: localSecondary,
      accent: localAccent,
    });
    toast.success(t('theme.toast.saved'));
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: t('theme.confirm.resetTitle'),
      message: t('theme.confirm.resetMessage'),
      confirmText: t('theme.actions.reset'),
      cancelText: t('common.actions.cancel'),
    });

    if (confirmed) {
      resetTheme();
      setLocalPrimary('#F4C20D');
      setLocalSecondary('#C68642');
      setLocalAccent('#2F2F2F');
      toast.info(t('theme.toast.reset'));
    }
  };

  return (
    <div className="stack" style={{ maxWidth: 600 }}>
      <Card>
        <CardHeader>
          <h2 style={{ margin: 0 }}>{t('theme.title')}</h2>
          <p className="muted" style={{ margin: '4px 0 0 0' }}>
            {t('theme.subtitle')}
          </p>
        </CardHeader>
        <CardBody>
          <div className="stack">
            {/* Primary Color */}
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label={t('theme.fields.primary')}
                  type="text"
                  value={localPrimary}
                  onChange={(e) => setLocalPrimary(e.target.value)}
                  placeholder="#F4C20D"
                />
              </div>
              <input
                type="color"
                value={localPrimary}
                onChange={(e) => setLocalPrimary(e.target.value)}
                style={{
                  width: 48,
                  height: 38,
                  padding: 0,
                  border: '1px solid var(--c-border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Secondary Color */}
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label={t('theme.fields.secondary')}
                  type="text"
                  value={localSecondary}
                  onChange={(e) => setLocalSecondary(e.target.value)}
                  placeholder="#C68642"
                />
              </div>
              <input
                type="color"
                value={localSecondary}
                onChange={(e) => setLocalSecondary(e.target.value)}
                style={{
                  width: 48,
                  height: 38,
                  padding: 0,
                  border: '1px solid var(--c-border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Accent Color */}
            <div className="row" style={{ alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <Input
                  label={t('theme.fields.accent')}
                  type="text"
                  value={localAccent}
                  onChange={(e) => setLocalAccent(e.target.value)}
                  placeholder="#2F2F2F"
                />
              </div>
              <input
                type="color"
                value={localAccent}
                onChange={(e) => setLocalAccent(e.target.value)}
                style={{
                  width: 48,
                  height: 38,
                  padding: 0,
                  border: '1px solid var(--c-border)',
                  borderRadius: 6,
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Preview */}
            <div style={{ marginTop: 16 }}>
              <p className="muted" style={{ marginBottom: 8, fontSize: 12 }}>{t('theme.preview.title')}</p>
              <div className="row">
                <div
                  style={{
                    width: 60,
                    height: 40,
                    backgroundColor: localPrimary,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                  }}
                >
                  {t('theme.preview.primary')}
                </div>
                <div
                  style={{
                    width: 70,
                    height: 40,
                    backgroundColor: localSecondary,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                  }}
                >
                  {t('theme.preview.secondary')}
                </div>
                <div
                  style={{
                    width: 60,
                    height: 40,
                    backgroundColor: localAccent,
                    borderRadius: 6,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontSize: 11,
                  }}
                >
                  {t('theme.preview.accent')}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
        <CardFooter>
          <div className="row spaceBetween" style={{ width: '100%' }}>
            <Button variant="secondary" onClick={handleReset}>
              {t('theme.actions.resetDefaults')}
            </Button>
            <Button onClick={handleSave}>
              {t('theme.actions.save')}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
