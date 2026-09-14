import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronRight,
  PhoneCall,
  MessageSquare,
  FileText,
  Eye,
  ArrowUpDown,
  Droplets,
  UserCircle,
} from 'lucide-react';
import SectionCard from '../../../components/sections/SectionCard';
import StatCard from '../../../components/sections/StatCard';

const patientKpis = [
  { label: 'Total Patients', value: 248, sub: 'Under active care', tone: 'primary' },
  { label: 'New This Month', value: 19, sub: '8 first-time consults', tone: 'sky' },
  { label: 'Follow-ups Due', value: 14, sub: 'Next 7 days', tone: 'amber' },
  { label: 'Chronic Cases', value: 63, sub: 'Long-term management', tone: 'rose' },
];

const patientsList = [
  { id: 'P-2041', name: 'Anita Shrestha', age: 34, gender: 'Female', phone: '+977 98•••231', email: 'anita@example.com', blood: 'O+', visits: 6, lastVisit: 'Today', nextVisit: '2 weeks', status: 'Active', allergies: ['Penicillin'], conditions: ['Hypertension', 'Type II Diabetes'], lastDiagnosis: 'Essential hypertension' },
  { id: 'P-2042', name: 'Prakash Rai', age: 41, gender: 'Male', phone: '+977 98•••114', email: 'prakash@example.com', blood: 'B+', visits: 2, lastVisit: 'Today', nextVisit: '1 week', status: 'New', allergies: [], conditions: ['Dyslipidemia'], lastDiagnosis: 'Atypical chest pain' },
  { id: 'P-2043', name: 'Bina Tamang', age: 28, gender: 'Female', phone: '+977 98•••702', email: 'bina@example.com', blood: 'A+', visits: 9, lastVisit: 'Yesterday', nextVisit: '3 weeks', status: 'Chronic', allergies: ['Sulfa'], conditions: ['MVP'], lastDiagnosis: 'Mitral valve prolapse, stable' },
  { id: 'P-2044', name: 'Suresh Magar', age: 52, gender: 'Male', phone: '+977 98•••556', email: 'suresh@example.com', blood: 'AB+', visits: 3, lastVisit: '2 days ago', nextVisit: '1 week', status: 'Active', allergies: [], conditions: ['CAD s/p PCI'], lastDiagnosis: 'Post-PCI follow up' },
  { id: 'P-2045', name: 'Gita Lama', age: 6, gender: 'Female', phone: '+977 98•••889', email: 'gita.parent@example.com', blood: 'A+', visits: 1, lastVisit: '3 days ago', nextVisit: '4 weeks', status: 'Referral', allergies: [], conditions: [], lastDiagnosis: 'Innocent murmur' },
  { id: 'P-2046', name: 'Rajan Thapa', age: 45, gender: 'Male', phone: '+977 98•••037', email: 'rajan@example.com', blood: 'B-', visits: 5, lastVisit: '5 days ago', nextVisit: '2 weeks', status: 'Active', allergies: ['Aspirin'], conditions: ['Hypertension'], lastDiagnosis: 'HTN on Telmisartan 40mg' },
  { id: 'P-2047', name: 'Sarita Gurung', age: 39, gender: 'Female', phone: '+977 98•••420', email: 'sarita@example.com', blood: 'O-', visits: 4, lastVisit: '1 week ago', nextVisit: '6 weeks', status: 'Active', allergies: [], conditions: ['Peripartum CMP - resolved'], lastDiagnosis: 'Postpartum follow up' },
  { id: 'P-2048', name: 'Kamal Bhandari', age: 61, gender: 'Male', phone: '+977 98•••318', email: 'kamal@example.com', blood: 'O-', visits: 12, lastVisit: '5 days ago', nextVisit: '1 week', status: 'Chronic', allergies: [], conditions: ['IHD', 'HTN', 'DM'], lastDiagnosis: 'Post-angio, LAD stent' },
  { id: 'P-2049', name: 'Hari Sharma', age: 54, gender: 'Male', phone: '+977 98•••010', email: 'hari@example.com', blood: 'A+', visits: 8, lastVisit: 'Yesterday', nextVisit: '1 month', status: 'Active', allergies: ['ACE-inhibitor cough'], conditions: ['DM + HTN'], lastDiagnosis: 'Medication adjusted' },
  { id: 'P-2050', name: 'Meera Karki', age: 32, gender: 'Female', phone: '+977 98•••122', email: 'meera@example.com', blood: 'B+', visits: 0, lastVisit: 'New', nextVisit: 'Tomorrow', status: 'New', allergies: [], conditions: [], lastDiagnosis: '—' },
];

const statusTone = {
  Active: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  New: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
  Chronic: 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
  Referral: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

const DoctorPatients = () => {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'lastVisit', dir: 'desc' });
  const [statusFilter, setStatusFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const toggleSort = (field) => {
    setSort((s) => ({ field, dir: s.field === field && s.dir === 'asc' ? 'desc' : 'asc' }));
  };

  const filtered = [...patientsList]
    .filter((p) => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.phone.includes(q) || (p.email && p.email.toLowerCase().includes(q));
    })
    .sort((a, b) => {
      const order = sort.dir === 'asc' ? 1 : -1;
      if (sort.field === 'visits') return (a.visits - b.visits) * order;
      if (sort.field === 'age') return (a.age - b.age) * order;
      if (sort.field === 'name') return a.name.localeCompare(b.name) * order;
      return 0;
    });

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {patientKpis.map((k) => (
          <StatCard key={k.label} icon={UserCircle} label={k.label} value={k.value} sub={k.sub} tone={k.tone} />
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient name, phone, email…"
              className="w-72 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
          <div className="relative">
            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-8 text-sm text-slate-700 outline-none transition-colors focus:border-primary-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              {['All', 'Active', 'New', 'Chronic', 'Referral'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <p className="text-xs font-semibold text-slate-500">{filtered.length} patients · Click a row to open the chart</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Patient table */}
        <SectionCard bodyClassName="p-0" className="lg:col-span-2" title="Patient registry" subtitle="Sort by clicking column headers">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-900/50">
                  <th className="px-4 py-3 font-semibold">
                    <button onClick={() => toggleSort('name')} className="flex items-center gap-1 hover:text-primary-700">
                      Patient <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="hidden px-4 py-3 font-semibold md:table-cell">Blood</th>
                  <th className="px-4 py-3 font-semibold">
                    <button onClick={() => toggleSort('visits')} className="flex items-center gap-1 hover:text-primary-700">
                      Visits <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="hidden px-4 py-3 font-semibold sm:table-cell">Last visit</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/70">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    onClick={() => setSelected(p)}
                    className={`cursor-pointer transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-900/10 ${selected?.id === p.id ? 'bg-primary-50/60 dark:bg-primary-900/20' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 font-display text-xs font-extrabold text-white">
                          {p.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.gender} · {p.age} yrs · {p.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">
                        <Droplets className="h-3 w-3" /> {p.blood}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200">{p.visits}</td>
                    <td className="hidden px-4 py-3 text-xs text-slate-600 sm:table-cell dark:text-slate-400">{p.lastVisit}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${statusTone[p.status]}`}>{p.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-slate-400" />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-400">No patients match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Patient detail card */}
        <SectionCard title="Patient detail" subtitle={selected ? selected.id : 'Select a patient'} bodyClassName={selected ? 'p-0' : undefined}>
          {!selected ? (
            <div className="py-12 text-center text-sm text-slate-400">
              <UserCircle className="mx-auto h-12 w-12 mb-3 text-slate-300 dark:text-slate-700" />
              Click a patient in the list to see their full chart.
            </div>
          ) : (
            <div className="divide-y divide-slate-50 dark:divide-slate-800/70">
              <div className="p-5 text-center bg-gradient-to-br from-primary-50 to-transparent dark:from-primary-900/20">
                <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-display text-lg font-extrabold text-white shadow-md">
                  {selected.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </span>
                <p className="mt-3 font-display text-lg font-bold text-slate-900 dark:text-white">{selected.name}</p>
                <p className="text-xs text-slate-500">{selected.gender} · {selected.age} yrs · Blood {selected.blood}</p>
                <p className="mt-1 text-xs text-slate-400">{selected.phone} · {selected.email}</p>
              </div>
              <div className="p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                    <p className="text-slate-500">Total visits</p>
                    <p className="mt-0.5 font-display text-xl font-bold text-slate-900 dark:text-white">{selected.visits}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                    <p className="text-slate-500">Next visit</p>
                    <p className="mt-0.5 font-semibold text-primary-700 dark:text-primary-300">{selected.nextVisit}</p>
                  </div>
                </div>
                {selected.conditions.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Known conditions</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.conditions.map((c) => (
                        <span key={c} className="rounded-md bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {selected.allergies.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-rose-500 uppercase tracking-wide">Allergies</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {selected.allergies.map((a) => (
                        <span key={a} className="rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last diagnosis</p>
                  <p className="mt-1 text-sm rounded-lg bg-slate-50 p-3 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                    {selected.lastDiagnosis}
                  </p>
                </div>
              </div>
              <div className="p-4 flex flex-wrap items-center gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                <Link to="/doctor/records" className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary-700">
                  <FileText className="h-3.5 w-3.5" /> View records
                </Link>
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                  <PhoneCall className="h-3.5 w-3.5" /> Call
                </button>
                <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                  <MessageSquare className="h-3.5 w-3.5" /> Message
                </button>
                <button className="ml-auto flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-white dark:border-slate-700 dark:text-slate-400">
                  <Eye className="h-3.5 w-3.5" /> Full history
                </button>
              </div>
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default DoctorPatients;