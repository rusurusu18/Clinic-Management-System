import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Building2, CalendarPlus, Mail, MapPin, Phone, Stethoscope, Users } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getDepartmentById } from '../services/departmentService.js';

const DepartmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDepartmentById(id)
      .then(setDepartment)
      .catch((requestError) => setError(requestError.message || 'Unable to load this department.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex-center min-h-[60vh] text-sm text-slate-500">Loading department...</div>;

  if (error || !department) {
    return (
      <div className="container-custom py-20 text-center">
        <Building2 className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-5 text-2xl font-bold text-slate-900 dark:text-white">Department unavailable</h1>
        <p className="mt-2 text-slate-500">{error || 'This department could not be found.'}</p>
        <Link to="/departments" className="mt-6 inline-block"><Button variant="primary" icon={<ArrowLeft className="h-4 w-4" />}>Back to departments</Button></Link>
      </div>
    );
  }

  const doctors = department.doctors || [];
  const headDoctor = department.headDoctor?.fullName || department.headDoctor?.user?.fullName;

  return (
    <div className="container-custom animate-fade-in-up py-10">
      <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-primary-700 dark:text-slate-400">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <Card className="p-6 sm:p-8" hoverable={false}>
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-primary-50 text-2xl font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">{department.name.charAt(0)}</span>
              <div>
                <span className="badge badge-success">Active department</span>
                <h1 className="mt-3 font-display text-3xl font-bold text-slate-900 dark:text-white">{department.name}</h1>
                <p className="mt-3 max-w-2xl leading-7 text-slate-600 dark:text-slate-400">{department.description || 'Specialist care delivered by an experienced clinical team.'}</p>
              </div>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><Users className="h-5 w-5 text-primary-600" /><p className="mt-2 text-xs text-slate-500">Specialists</p><p className="font-bold text-slate-900 dark:text-white">{department._count?.doctors || doctors.length}</p></div>
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60"><Stethoscope className="h-5 w-5 text-primary-600" /><p className="mt-2 text-xs text-slate-500">Department head</p><p className="font-bold text-slate-900 dark:text-white">{headDoctor || 'Clinical team'}</p></div>
            </div>
          </Card>

          <Card className="p-6 sm:p-8" hoverable={false}>
            <div className="flex items-center justify-between gap-4"><h2 className="text-xl font-bold text-slate-900 dark:text-white">Our specialists</h2><span className="text-sm text-slate-500">{doctors.length} listed</span></div>
            {doctors.length > 0 ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {doctors.map((doctor) => (
                  <Link key={doctor.id} to={`/doctors/${doctor.id}`} className="flex items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:border-primary-300 hover:bg-primary-50/50 dark:border-slate-800 dark:hover:bg-slate-800">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300"><Stethoscope className="h-5 w-5" /></span>
                    <span><span className="block font-semibold text-slate-900 dark:text-white">{doctor.user?.fullName || 'Medical specialist'}</span><span className="text-xs text-slate-500">{doctor.specialization || 'Specialist physician'}</span></span>
                  </Link>
                ))}
              </div>
            ) : <p className="mt-5 text-sm text-slate-500">Specialist profiles will be listed here soon.</p>}
          </Card>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6" hoverable={false}>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Department information</h2>
            <div className="mt-5 space-y-4 text-sm">
              {(department.hospital || department.location) && <div className="flex gap-3 text-slate-600 dark:text-slate-400"><MapPin className="h-5 w-5 shrink-0 text-primary-600" /><span>{department.location || department.hospital}</span></div>}
              {department.phone && <a href={`tel:${department.phone}`} className="flex gap-3 text-slate-600 hover:text-primary-700 dark:text-slate-400"><Phone className="h-5 w-5 shrink-0 text-primary-600" />{department.phone}</a>}
              {department.email && <a href={`mailto:${department.email}`} className="flex gap-3 break-all text-slate-600 hover:text-primary-700 dark:text-slate-400"><Mail className="h-5 w-5 shrink-0 text-primary-600" />{department.email}</a>}
            </div>
            <Link to="/book" className="mt-7 block"><Button variant="primary" size="lg" fullWidth icon={<CalendarPlus className="h-5 w-5" />}>Book an appointment</Button></Link>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default DepartmentDetail;