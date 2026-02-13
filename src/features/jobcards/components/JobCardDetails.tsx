import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { JobCardHeader } from "./JobCardHeader";
import { TasksTab } from "../tabs/TasksTab";
import { StationTab } from "../tabs/StationTab";
import { LineItemsTab } from "../tabs/LineItemsTab";
import { PartRequestsTab } from "../tabs/PartRequestsTab";
import { InvoiceTab } from "../tabs/InvoiceTab";

interface JobCardDetailsProps {
  jobCard: any;
  onBack: () => void;
}

export const JobCardDetails: React.FC<JobCardDetailsProps> = ({ jobCard, onBack }) => {
  const [activeTab, setActiveTab] = useState("details");

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button variant="secondary" size="sm" onClick={onBack}>
          <ChevronLeft size={18} style={{ marginRight: '4px' }} />
          Back to List
        </Button>
        <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>
          Job Card: {jobCard.plate}
        </h2>
      </div>

      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid var(--c-border)',
        gap: '24px',
        marginBottom: '8px'
      }}>
        {['details', 'tasks', 'stations', 'line-items', 'part-requests', 'billing'].map((tab) => (
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
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      <div style={{ flex: 1 }}>
        <JobCardHeader jobCard={jobCard} />
        
        {activeTab === 'details' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle & Customer</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>Customer</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.customerName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>Plate Number</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.plate}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>Status</span>
                  <span style={{ 
                    padding: '2px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px',
                    backgroundColor: jobCard.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    color: jobCard.status === 'COMPLETED' ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'
                  }}>{jobCard.status}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timeline & Usage</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>Mileage</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.mileage?.toLocaleString() || '0'} km</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>Check-in</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.entryAt ? new Date(jobCard.entryAt).toLocaleString() : "-"}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--c-border)', paddingBottom: '8px' }}>
                  <span style={{ color: 'var(--c-muted)' }}>Check-out</span>
                  <span style={{ fontWeight: 500 }}>{jobCard.exitAt ? new Date(jobCard.exitAt).toLocaleString() : "-"}</span>
                </div>
              </div>
            </div>

            {jobCard.notes && (
              <div style={{ gridColumn: 'span 2', marginTop: '8px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--c-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Notes</h3>
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
        ) : activeTab === 'tasks' ? (
          <TasksTab jobCardId={jobCard.id} />
        ) : activeTab === 'stations' ? (
          <StationTab jobCardId={jobCard.id} />
        ) : activeTab === 'line-items' ? (
          <LineItemsTab jobCardId={jobCard.id} />
        ) : activeTab === 'billing' ? (
          <InvoiceTab jobCardId={jobCard.id} />
        ) : (
          <PartRequestsTab jobCardId={jobCard.id} />
        )}
      </div>
    </div>
  );
};
