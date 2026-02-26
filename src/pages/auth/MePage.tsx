import { useAuth } from '@/hooks/useAuth';
import { Card, CardHeader, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Accordion, AccordionItem } from '@/components/ui/Accordion';
import { Button } from '@/components/ui/Button';
import { toast } from '@/components/ui/Toast';
import { getNav } from '@/app/nav';
import { flattenNav } from '@/features/profile/accessSummary/navAccess';
import '@/styles/global.css';

/**
 * Enhanced User profile page
 */
export default function MePage() {
  const { user } = useAuth();
  const navGroups = getNav(user?.role);
  const allowedNodes = flattenNav(navGroups);

  const stats = {
    pages: allowedNodes.length,
    groups: navGroups.length,
    branchScoped: user?.role !== 'HQ_ADMIN' ? 'Yes' : 'No'
  };

  const copyAccessSummary = () => {
    const text = `
Profile Summary:
Email: ${user?.email}
Name: ${user?.name}
Role: ${user?.role}
Branch: ${user?.branchId || 'All Branches / N/A'}

Accessible Pages:
${allowedNodes.map(n => `- ${n.label} (${n.path})`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    toast.success('Access summary copied to clipboard!');
  };

  const quickLinks = allowedNodes.slice(0, 5);

  return (
    <div className="page" style={{ paddingBottom: '40px' }}>
      <div className="stack" style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '24px' }}>My Profile</h1>

        <div className="row" style={{ alignItems: 'flex-start', gap: '24px' }}>
          {/* Section A: Profile Card */}
          <Card style={{ flex: 1 }}>
            <CardHeader>
              <h3 style={{ margin: 0 }}>Personal Information</h3>
            </CardHeader>
            <CardBody>
              <div className="stack" style={{ gap: '16px' }}>
                <div className="row spaceBetween">
                  <span className="muted">Name</span>
                  <span style={{ fontWeight: 500 }}>{user?.name || 'N/A'}</span>
                </div>
                <div className="row spaceBetween">
                  <span className="muted">Email</span>
                  <span style={{ fontWeight: 500 }}>{user?.email || 'N/A'}</span>
                </div>
                <div className="row spaceBetween">
                  <span className="muted">Role</span>
                  <Badge>{user?.role || 'N/A'}</Badge>
                </div>
                <div className="row spaceBetween">
                  <span className="muted">Branch</span>
                  <span style={{ fontWeight: 500 }}>{user?.branchId || 'All Branches / N/A'}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Section B: Your Access Overview */}
          <Card style={{ flex: 1 }}>
            <CardHeader>
              <h3 style={{ margin: 0 }}>Your Access</h3>
            </CardHeader>
            <CardBody>
              <div className="row" style={{ gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: 'var(--c-bg)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--c-primary)' }}>{stats.pages}</div>
                  <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Accessible Pages</div>
                </div>
                <div style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: 'var(--c-bg)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--c-primary)' }}>{stats.groups}</div>
                  <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Nav Groups</div>
                </div>
                <div style={{ flex: 1, minWidth: '120px', padding: '12px', backgroundColor: 'var(--c-bg)', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--c-primary)' }}>{stats.branchScoped}</div>
                  <div className="muted" style={{ fontSize: '11px', textTransform: 'uppercase' }}>Branch Scoped</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Section D: Quick Links */}
        <div style={{ marginTop: '24px' }}>
          <h4 style={{ marginBottom: '12px' }}>Quick Links</h4>
          <div className="row" style={{ gap: '8px', flexWrap: 'wrap' }}>
            {quickLinks.map(link => (
              <Button key={link.path} variant="outline" size="sm" onClick={() => window.location.href = link.path}>
                {link.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Section C: Accessible Pages & Tabs */}
        <div style={{ marginTop: '32px' }}>
          <div className="row spaceBetween" style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: 0 }}>Detailed Access List</h4>
            <Button size="sm" onClick={copyAccessSummary}>Copy Access Summary</Button>
          </div>
          <Accordion>
            {navGroups.map(group => (
              <AccordionItem key={group.label} title={group.label}>
                <div className="stack" style={{ gap: '12px' }}>
                  {group.items.map((item: any) => (
                    <div key={item.path} style={{ padding: '8px', backgroundColor: 'var(--c-bg)', borderRadius: '6px' }}>
                      <div className="row spaceBetween">
                        <span style={{ fontWeight: 500 }}>{item.label}</span>
                        <code style={{ fontSize: '11px', color: 'var(--c-muted)' }}>{item.path}</code>
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <p className="muted" style={{ fontSize: '11px', margin: 0 }}>
                          Tabs: <span style={{ color: 'var(--c-text)' }}>Not configured in nav.ts</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
}
