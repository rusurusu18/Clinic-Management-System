import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ListOrdered,
  Receipt,
  Settings,
} from 'lucide-react';

const navItems = [
  { to: '/staff', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/staff/queue', label: 'Live Queue', icon: ListOrdered, dot: true },
  { to: '/staff/appointments', label: 'Appointments', icon: CalendarDays, badge: '48' },
  { to: '/staff/patients', label: 'Patients', icon: Users },
  { to: '/staff/billing', label: 'Billing', icon: Receipt },
  { to: '/staff/settings', label: 'Settings', icon: Settings },
];

const titles = {
  '/staff': { title: 'Staff Dashboard Overview', subtitle: 'Live status, walk-ins, and schedule control' },
  '/staff/queue': { title: 'Live Queue', subtitle: 'Real-time token status per doctor' },
  '/staff/appointments': { title: 'Appointments', subtitle: 'Manage bookings, check-ins and status' },
  '/staff/patients': { title: 'Patients', subtitle: 'Registry and visit history' },
  '/staff/billing': { title: 'Billing', subtitle: 'Invoices and payments' },
  '/staff/settings': { title: 'Staff Settings', subtitle: 'Desk preferences, audio alerts and credentials' },
};

const StaffLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const meta = titles[pathname] || { title: 'Dashboard', subtitle: '' };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} navItems={navItems} title="Staff Portal" />

      <div className="lg:pl-72">
        <Topbar onMenu={() => setSidebarOpen(true)} title={meta.title} subtitle={meta.subtitle} />
        <main className="mx-auto max-w-7xl p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StaffLayout;
