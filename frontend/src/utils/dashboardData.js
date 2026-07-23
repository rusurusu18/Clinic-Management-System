// ============================================================
// Dashboard demo data — stands in for the REST/WebSocket feed
// described in the PRD (§4.11 Admin Dashboard & Reports).
// Replace these with live API/Socket.IO data when the backend
// is wired up; the shapes are intentionally close to §6.2.
// ============================================================

export const currency = (n) =>
  'Rs. ' + Number(n || 0).toLocaleString('en-IN');

export const shortCurrency = (n) => {
  if (n >= 100000) return 'Rs. ' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000) return 'Rs. ' + (n / 1000).toFixed(1) + 'k';
  return 'Rs. ' + n;
};

// --- KPI snapshot (today vs yesterday) ---------------------
export const kpis = [
  { key: 'appointments', label: "Today's Appointments", value: 48, delta: 12.5, sub: '32 web · 16 staff', icon: 'CalendarCheck', tone: 'primary' },
  { key: 'patients', label: 'Patients Seen', value: 41, delta: 8.1, sub: '7 in progress', icon: 'Users', tone: 'sky' },
  { key: 'revenue', label: 'Revenue Today', value: 86400, display: 'Rs. 86.4k', delta: 18.2, sub: 'Rs. 61k online · Rs. 25k cash', icon: 'Wallet', tone: 'emerald' },
  { key: 'noshow', label: 'No-shows', value: 3, delta: -25, sub: '6.2% of booked', icon: 'UserX', tone: 'rose' },
];

export const staffKpis = [
  { label: "Today's Appointments", val: '48', sub: '+12% from yesterday' },
  { label: 'Checked-in / Waiting', val: '14', sub: 'Active in queue' },
  { label: 'Doctors On Duty', val: '6', sub: 'Across 4 departments' },
  { label: 'Collection Today', val: 'Rs. 42,500', sub: 'Cash & Digital' },
];

// --- Revenue trend, last 14 days ---------------------------
export const revenueTrend = [
  { day: 'Jul 10', online: 38000, cash: 21000 },
  { day: 'Jul 11', online: 42000, cash: 18000 },
  { day: 'Jul 12', online: 35000, cash: 24000 },
  { day: 'Jul 13', online: 51000, cash: 19000 },
  { day: 'Jul 14', online: 47000, cash: 22000 },
  { day: 'Jul 15', online: 44000, cash: 17000 },
  { day: 'Jul 16', online: 39000, cash: 15000 },
  { day: 'Jul 17', online: 55000, cash: 20000 },
  { day: 'Jul 18', online: 58000, cash: 23000 },
  { day: 'Jul 19', online: 52000, cash: 18000 },
  { day: 'Jul 20', online: 61000, cash: 21000 },
  { day: 'Jul 21', online: 57000, cash: 26000 },
  { day: 'Jul 22', online: 64000, cash: 22000 },
  { day: 'Jul 23', online: 61000, cash: 25000 },
];

// --- Booking source split (public website vs staff) --------
export const bookingSource = [
  { label: 'Public website', value: 312, color: '#0d9488' },
  { label: 'Staff / walk-in', value: 168, color: '#38bdf8' },
];

// --- Payment method breakdown ------------------------------
export const paymentMix = [
  { label: 'eSewa', value: 44, color: '#10b981' },
  { label: 'Khalti', value: 33, color: '#8b5cf6' },
  { label: 'Cash', value: 23, color: '#f59e0b' },
];

// --- Doctor load (patients seen this week) -----------------
export const doctorLoad = [
  { name: 'Dr. Ram Sharma', dept: 'Cardiology', count: 58, initials: 'RS' },
  { name: 'Dr. Sunita Karki', dept: 'Gynecology', count: 49, initials: 'SK' },
  { name: 'Dr. Hari Adhikari', dept: 'Neurology', count: 41, initials: 'HA' },
  { name: 'Dr. Bijay Shrestha', dept: 'Orthopedics', count: 37, initials: 'BS' },
  { name: 'Dr. Laxmi Poudel', dept: 'Pediatrics', count: 29, initials: 'LP' },
];

// --- Today's appointments ----------------------------------
export const todaysAppointments = [
  { id: 'A-1042', token: 'C-07', patient: 'Anita Shrestha', doctor: 'Dr. Ram Sharma', dept: 'Cardiology', time: '10:00 AM', source: 'web', status: 'In progress', fee: 1500, paid: true },
  { id: 'A-1043', token: 'G-03', patient: 'Prakash Rai', doctor: 'Dr. Sunita Karki', dept: 'Gynecology', time: '10:15 AM', source: 'staff', status: 'Checked-in', fee: 1400, paid: false },
  { id: 'A-1044', token: 'N-05', patient: 'Bina Tamang', doctor: 'Dr. Hari Adhikari', dept: 'Neurology', time: '10:30 AM', source: 'web', status: 'Booked', fee: 2000, paid: true },
  { id: 'A-1045', token: 'O-02', patient: 'Suresh Magar', doctor: 'Dr. Bijay Shrestha', dept: 'Orthopedics', time: '10:45 AM', source: 'web', status: 'Booked', fee: 1800, paid: true },
  { id: 'A-1046', token: 'P-06', patient: 'Gita Lama', doctor: 'Dr. Laxmi Poudel', dept: 'Pediatrics', time: '11:00 AM', source: 'staff', status: 'Completed', fee: 1000, paid: true },
  { id: 'A-1047', token: 'C-08', patient: 'Rajan Thapa', doctor: 'Dr. Ram Sharma', dept: 'Cardiology', time: '11:15 AM', source: 'web', status: 'No-show', fee: 1500, paid: false },
];

// --- Live queue (per doctor, per PRD §4.7) -----------------
export const liveQueue = [
  { doctor: 'Dr. Ram Sharma', dept: 'Cardiology', current: 'C-07', waiting: 4, eta: '~20 min', initials: 'RS' },
  { doctor: 'Dr. Sunita Karki', dept: 'Gynecology', current: 'G-03', waiting: 2, eta: '~12 min', initials: 'SK' },
  { doctor: 'Dr. Hari Adhikari', dept: 'Neurology', current: 'N-04', waiting: 5, eta: '~28 min', initials: 'HA' },
];

// --- Activity / notifications feed -------------------------
export const activityFeed = [
  { id: 1, type: 'booking', text: 'New online booking — Anita Shrestha with Dr. Ram Sharma', time: '2 min ago' },
  { id: 2, type: 'payment', text: 'Payment received — Rs. 2,000 via Khalti (Invoice #INV-2231)', time: '9 min ago' },
  { id: 3, type: 'checkin', text: 'Prakash Rai checked in — token G-03', time: '15 min ago' },
  { id: 4, type: 'noshow', text: 'No-show flagged — Rajan Thapa (Cardiology)', time: '22 min ago' },
  { id: 5, type: 'booking', text: 'New online booking — Suresh Magar with Dr. Bijay Shrestha', time: '31 min ago' },
];

// --- Patients (registry sample) ----------------------------
export const patients = [
  { id: 'P-2041', name: 'Anita Shrestha', phone: '+977 98•• ••231', age: 34, gender: 'Female', lastVisit: 'Jul 23, 2026', visits: 6, source: 'web' },
  { id: 'P-2042', name: 'Prakash Rai', phone: '+977 98•• ••114', age: 41, gender: 'Male', lastVisit: 'Jul 23, 2026', visits: 2, source: 'staff' },
  { id: 'P-2043', name: 'Bina Tamang', phone: '+977 98•• ••702', age: 28, gender: 'Female', lastVisit: 'Jul 22, 2026', visits: 9, source: 'web' },
  { id: 'P-2044', name: 'Suresh Magar', phone: '+977 98•• ••556', age: 52, gender: 'Male', lastVisit: 'Jul 22, 2026', visits: 3, source: 'web' },
  { id: 'P-2045', name: 'Gita Lama', phone: '+977 98•• ••889', age: 6, gender: 'Female', lastVisit: 'Jul 21, 2026', visits: 4, source: 'staff' },
  { id: 'P-2046', name: 'Rajan Thapa', phone: '+977 98•• ••037', age: 45, gender: 'Male', lastVisit: 'Jul 20, 2026', visits: 1, source: 'web' },
  { id: 'P-2047', name: 'Sarita Gurung', phone: '+977 98•• ••420', age: 39, gender: 'Female', lastVisit: 'Jul 20, 2026', visits: 7, source: 'web' },
  { id: 'P-2048', name: 'Kamal Bhandari', phone: '+977 98•• ••318', age: 61, gender: 'Male', lastVisit: 'Jul 19, 2026', visits: 12, source: 'staff' },
];

// --- Invoices (billing) ------------------------------------
export const invoices = [
  { id: 'INV-2231', patient: 'Anita Shrestha', date: 'Jul 23, 2026', amount: 1500, method: 'Khalti', status: 'Paid' },
  { id: 'INV-2232', patient: 'Prakash Rai', date: 'Jul 23, 2026', amount: 1400, method: 'Cash', status: 'Pending' },
  { id: 'INV-2233', patient: 'Bina Tamang', date: 'Jul 22, 2026', amount: 2000, method: 'eSewa', status: 'Paid' },
  { id: 'INV-2234', patient: 'Suresh Magar', date: 'Jul 22, 2026', amount: 1800, method: 'eSewa', status: 'Paid' },
  { id: 'INV-2235', patient: 'Gita Lama', date: 'Jul 21, 2026', amount: 1000, method: 'Cash', status: 'Paid' },
  { id: 'INV-2236', patient: 'Rajan Thapa', date: 'Jul 21, 2026', amount: 1500, method: '—', status: 'Refunded' },
  { id: 'INV-2237', patient: 'Sarita Gurung', date: 'Jul 20, 2026', amount: 1600, method: 'Khalti', status: 'Paid' },
];

// --- Status → badge variant mapping ------------------------
export const statusVariant = {
  Booked: 'gray',
  'Checked-in': 'info',
  'In progress': 'warning',
  Completed: 'success',
  'No-show': 'danger',
  Cancelled: 'danger',
  Paid: 'success',
  Pending: 'warning',
  Refunded: 'gray',
  'Partially Paid': 'info',
};
