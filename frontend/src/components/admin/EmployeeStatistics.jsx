import React, { memo } from 'react';
import EmployeeStatisticCard from './EmployeeStatisticCard';
import { Users, ShieldCheck, UserRound } from 'lucide-react';

const EmployeeStatistics = memo(({ totalCount = 0, adminCount = 0, staffCount = 0 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 font-sans">
      {/* Card 1: Total Employees (Primary Accent: #31747d) */}
      <EmployeeStatisticCard
        title="Total Employees"
        value={totalCount}
        description="All registered staff members."
        icon={Users}
        color="text-[#31747d]"
        bgColor="bg-[#31747d]/10"
      />

      {/* Card 2: Admins (Secondary Accent: #3ea9c4) */}
      <EmployeeStatisticCard
        title="Admins"
        value={adminCount}
        description="System administrator accounts."
        icon={ShieldCheck}
        color="text-[#3ea9c4]"
        bgColor="bg-[#3ea9c4]/15"
      />

      {/* Card 3: Staff (Secondary Accent: #3ea9c4) */}
      <EmployeeStatisticCard
        title="Staff"
        value={staffCount}
        description="Operational team members."
        icon={UserRound}
        color="text-[#3ea9c4]"
        bgColor="bg-[#3ea9c4]/15"
      />
    </div>
  );
});

export default EmployeeStatistics;
