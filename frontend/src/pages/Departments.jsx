import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Search, Users, X } from 'lucide-react';
import Card from '../components/ui/Card';
import { useDepartmentContext } from '../hooks/useDepartmentContext.js';

const DepartmentIcon = ({ name }) => {
  const firstLetter = name?.trim().charAt(0).toUpperCase() || 'D';
  return (
    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-xl font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
      {firstLetter}
    </span>
  );
};

const Departments = () => {
  const { departments, loading, error } = useDepartmentContext();
  const [search, setSearch] = useState('');

  const filteredDepartments = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return departments;
    return departments.filter((department) => [department.name, department.description, department.hospital, department.location]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query));
  }, [departments, search]);

  return (
    <div className="bg-slate-50 py-12 dark:bg-slate-950 sm:py-16">
      <div className="container-custom">
        <div className="mx-auto max-w-3xl text-center">
          <span className="section-kicker"><Building2 className="h-4 w-4" /> Care departments</span>
          <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Find the right team for your care.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-600 dark:text-slate-400 sm:text-lg">
            Explore our active departments, meet their specialists, and book care with the information you need upfront.
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments, specialties, or locations"
              className="h-14 w-full rounded-2xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-white" aria-label="Clear search">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
        </div>

        {loading && <p className="py-20 text-center text-sm text-slate-500">Loading care departments...</p>}
        {error && !loading && <p className="py-20 text-center text-sm text-red-600">{error}</p>}

        {!loading && !error && filteredDepartments.length === 0 && (
          <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">No departments found</h2>
            <p className="mt-2 text-sm text-slate-500">Try a different search term.</p>
          </div>
        )}

        {!loading && !error && filteredDepartments.length > 0 && (
          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDepartments.map((department) => (
              <Card key={department.id} className="group flex h-full flex-col p-6">
                <div className="flex items-start justify-between gap-4">
                  <DepartmentIcon name={department.name} />
                  <span className="badge badge-success">Active</span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">{department.name}</h2>
                <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {department.description || 'Specialist care delivered by an experienced clinical team.'}
                </p>
                <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Users className="h-4 w-4 text-primary-600" /> {department._count?.doctors || 0} specialists</div>
                  {(department.location || department.hospital) && <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400"><Building2 className="h-4 w-4 text-primary-600" /> {department.location || department.hospital}</div>}
                </div>
                <Link to={`/departments/${department.id}`} className="btn btn-secondary btn-sm mt-5 w-full">
                  View department <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Departments;