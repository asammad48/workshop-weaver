import { useState } from 'react';
import { Card, CardHeader, CardBody, CardFooter } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { confirm } from '@/components/ui/ConfirmDialog';
import { useThemeStore } from '@/state/themeStore';
import { AppLayout } from '@/components/layout/AppLayout';
import '@/styles/global.css';

export default function ThemePage() {
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
    toast.success('Theme saved successfully!');
  };

  const handleReset = async () => {
    const confirmed = await confirm({
      title: 'Reset Theme',
      message: 'Are you sure you want to reset to default colors?',
      confirmText: 'Reset',
      cancelText: 'Cancel',
    });

    if (confirmed) {
      resetTheme();
      setLocalPrimary('#0d6efd');
      setLocalSecondary('#6c757d');
      setLocalAccent('#0dcaf0');
      toast.info('Theme reset to defaults');
    }
  };

  return (
    <AppLayout>
      <div className="stack" style={{ maxWidth: 600 }}>
        <Card>
          <CardHeader>
            <h2 style={{ margin: 0 }}>Theme Settings</h2>
            <p className="muted" style={{ margin: '4px 0 0 0' }}>
              Customize the application colors
            </p>
          </CardHeader>
          <CardBody>
            <div className="stack">
              {/* Primary Color */}
              <div className="row" style={{ alignItems: 'flex-end' }}>
                <div style={{ flex: 1 }}>
                  <Input
                    label="Primary Color"
                    type="text"
                    value={localPrimary}
                    onChange={(e) => setLocalPrimary(e.target.value)}
                    placeholder="#0d6efd"
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
                    label="Secondary Color"
                    type="text"
                    value={localSecondary}
                    onChange={(e) => setLocalSecondary(e.target.value)}
                    placeholder="#6c757d"
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
                    label="Accent Color"
                    type="text"
                    value={localAccent}
                    onChange={(e) => setLocalAccent(e.target.value)}
                    placeholder="#0dcaf0"
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
                <p className="muted" style={{ marginBottom: 8, fontSize: 12 }}>Preview</p>
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
                    Primary
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
                    Secondary
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
                    Accent
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
          <CardFooter>
            <div className="row spaceBetween" style={{ width: '100%' }}>
              <Button variant="secondary" onClick={handleReset}>
                Reset to Defaults
              </Button>
              <Button onClick={handleSave}>
                Save Theme
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </AppLayout>
  );
}
