import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobCardHeader } from "./JobCardHeader";
import { TasksTab } from "../tabs/TasksTab";
import { StationTab } from "../tabs/StationTab";
import { LineItemsTab } from "../tabs/LineItemsTab";
import { PartRequestsTab } from "../tabs/PartRequestsTab";
import { InvoiceTab } from "../tabs/InvoiceTab";
import { RoadblockersTab } from "../tabs/RoadblockersTab";
import { ApprovalsTab } from "../tabs/ApprovalsTab";
import { CommunicationsTab } from "../tabs/CommunicationsTab";
import { AttachmentsTab } from "../tabs/AttachmentsTab";
import { DiagnosisTab } from "../tabs/DiagnosisTab";
import { JOB_CARD_STATUS_LABELS, JobCardStatus } from "@/constants/enums";
import { useI18n } from "@/i18n";

interface JobCardDetailsProps {
  jobCard: any;
  onBack: () => void;
}

export const JobCardDetails: React.FC<JobCardDetailsProps> = ({ jobCard, onBack }) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("details");
  const tabLabels: Record<string, string> = {
    details: t('jobCards.tabs.details'),
    stations: t('jobCards.tabs.stations'),
    tasks: t('jobCards.tabs.tasks'),
    diagnosis: t('jobCards.tabs.diagnosis'),
    'part-requests': t('jobCards.tabs.partRequests'),
    'line-items': t('jobCards.tabs.lineItems'),
    billing: t('jobCards.tabs.billing'),
    roadblockers: t('jobCards.tabs.roadblockers'),
    approvals: t('jobCards.tabs.approvals'),
    communications: t('jobCards.tabs.communications'),
    attachments: t('jobCards.tabs.attachments'),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button variant="secondary" size="sm" onClick={onBack}>
          <ChevronLeft size={18} style={{ marginRight: '4px' }} />
          {t('jobCards.backToList')}
        </Button>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
          {t('jobCards.title')}: {jobCard.plate}
        </h2>
      </div>

      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--c-border)',
        gap: '24px',
        marginBottom: '8px',
        overflowX: 'auto'
      }}>
              {['details', 'stations', 'tasks', 'diagnosis', 'part-requests', 'line-items',  'billing', 'roadblockers', 'approvals', 'communications', 'attachments'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '12px 4px',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === tab ? 'var(--c-primary)' : 'var(--c-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--c-primary)' : '2px solid transparent',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tabLabels[tab] || tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <JobCardHeader jobCard={jobCard} />
        
        {activeTab === 'details' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('jobCards.detailsSection.vehicleCustomer')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.customer')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.customerName || "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.driver')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.driverName || "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.plateNumber')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.vehiclePlate || jobCard.plate || "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.branch')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.branchName || "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.station')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.currentStationName || jobCard.currentStationCode || "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.status')}</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    backgroundColor: jobCard.status === JobCardStatus.PAGADO ? 'rgba(34, 197, 94, 0.1)' : jobCard.status === JobCardStatus.EN_PROCESO ? 'rgba(59, 130, 246, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                    color: jobCard.status === JobCardStatus.PAGADO ? 'rgb(34, 197, 94)' : jobCard.status === JobCardStatus.EN_PROCESO ? 'rgb(59, 130, 246)' : 'rgb(107, 114, 128)'
                  }}>{jobCard.statusName || JOB_CARD_STATUS_LABELS[jobCard.status] || jobCard.status}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('jobCards.detailsSection.estimatedTimeline')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.requestedEta')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.requestedEta ? new Date(jobCard.requestedEta).toLocaleString() : "—"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.latestEstEta')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.latestEstimatedEta ? new Date(jobCard.latestEstimatedEta).toLocaleString() : "—"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.latestEstPrice')}</span>
                  <span style={{ fontWeight: 500 }}>
                    {jobCard.latestEstimatedPrice !== undefined && jobCard.latestEstimatedPrice !== null
                      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(jobCard.latestEstimatedPrice)
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('jobCards.detailsSection.latestDiagnosisSummary')}</h3>
              <div style={{
                padding: '12px',
                backgroundColor: 'var(--c-bg)',
                borderRadius: '6px',
                border: '1px solid var(--c-border)',
                fontSize: '14px',
                lineHeight: '1.5',
                minHeight: '80px',
                whiteSpace: 'pre-wrap'
              }}>
                {jobCard.latestDiagnosisSummary || t('jobCards.detailsSection.noDiagnosisSummary')}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t('jobCards.detailsSection.timelineUsage')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.mileage')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.mileage?.toLocaleString() || '0'} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.checkIn')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.entryAt ? new Date(jobCard.entryAt).toLocaleString() : "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>{t('jobCards.detailsSection.checkOut')}</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.exitAt ? new Date(jobCard.exitAt).toLocaleString() : "-"}</span>
                </div>
              </div>
            </div>

            {jobCard.notes && (
              <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>{t('jobCards.detailsSection.notes')}</h3>
                <div style={{ 
                  padding: '12px', 
                  backgroundColor: 'var(--c-bg)', 
                  borderRadius: '6px', 
                  border: '1px solid var(--c-border)',
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {jobCard.notes}
                </div>
              </div>
            )}
          </div>
        ) : activeTab === 'diagnosis' ? (
          <DiagnosisTab jobCardId={jobCard.id} />
        ) : activeTab === 'tasks' ? (
          <TasksTab jobCardId={jobCard.id} />
        ) : activeTab === 'stations' ? (
          <StationTab jobCardId={jobCard.id} />
        ) : activeTab === 'line-items' ? (
          <LineItemsTab jobCardId={jobCard.id} />
        ) : activeTab === 'billing' ? (
          <InvoiceTab jobCardId={jobCard.id} />
        ) : activeTab === 'roadblockers' ? (
          <RoadblockersTab jobCardId={jobCard.id} />
        ) : activeTab === 'approvals' ? (
          <ApprovalsTab jobCardId={jobCard.id} />
        ) : activeTab === 'communications' ? (
          <CommunicationsTab jobCardId={jobCard.id} />
        ) : activeTab === 'attachments' ? (
          <AttachmentsTab jobCardId={jobCard.id} />
        ) : (
          <PartRequestsTab jobCardId={jobCard.id} />
        )}
      </div>
    </div>
  );
};
