import React, { useState } from 'react';
import GuestInformationCard from './GuestInformationCard';
import RecordInformationCard from './RecordInformationCard';
import RecentActivitiesCard from './RecentActivitiesCard';
import SystemHistoryCard from './SystemHistoryCard';
import FullAuditHistoryModal from '../modals/FullAuditHistoryModal';

const OverviewTab = ({
  guest,
  recentActivities = [],
  recentAuditLogs = [],
  onNavigateTab,
  onSaveInline,
  saving
}) => {
  const [isFullAuditModalOpen, setIsFullAuditModalOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      {/* Left Column (7 cols): Guest Information & Record Information */}
      <div className="lg:col-span-7 space-y-6">
        <GuestInformationCard
          guest={guest}
          onSave={onSaveInline}
          saving={saving}
        />

        <RecordInformationCard guest={guest} />
      </div>

      {/* Right Column (5 cols): Recent Activities & System History */}
      <div className="lg:col-span-5 space-y-6">
        <RecentActivitiesCard
          activities={recentActivities}
          onNavigateActivities={() => onNavigateTab('activities')}
        />

        <SystemHistoryCard
          auditLogs={recentAuditLogs}
          onOpenFullAuditModal={() => setIsFullAuditModalOpen(true)}
        />
      </div>

      {/* View All Audit History Modal */}
      <FullAuditHistoryModal
        isOpen={isFullAuditModalOpen}
        onClose={() => setIsFullAuditModalOpen(false)}
        auditLogs={recentAuditLogs}
        totalLogs={recentAuditLogs.length}
      />
    </div>
  );
};

export default OverviewTab;
