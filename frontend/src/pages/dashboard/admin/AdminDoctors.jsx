import { useCallback, useEffect, useState } from 'react';
import { BadgeCheck, ExternalLink, RefreshCw, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDoctorApplications, reviewDoctorApplication } from '../../../services/doctorService.js';

const statuses = [
  { value: 'PENDING', label: 'Pending review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const AdminDoctors = () => {
  const [status, setStatus] = useState('PENDING');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewingId, setReviewingId] = useState('');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setApplications(await getDoctorApplications(status));
    } catch (requestError) {
      const message = requestError.response?.data?.message || 'Could not load doctor applications.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleReview = async (doctorId, nextStatus) => {
    setReviewingId(doctorId);
    try {
      await reviewDoctorApplication(doctorId, nextStatus);
      toast.success(`Doctor application ${nextStatus.toLowerCase()}.`);
      await loadApplications();
    } catch (requestError) {
      toast.error(requestError.response?.data?.message || 'Could not update this application.');
    } finally {
      setReviewingId('');
    }
  };

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">Review credentials and certificates before listing a doctor.</p>
        <button type="button" onClick={loadApplications} disabled={loading} className="btn btn-secondary btn-sm">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Application status">
        {statuses.map((item) => (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={status === item.value}
            onClick={() => setStatus(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              status === item.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {loading && <p className="py-12 text-center text-sm text-slate-500">Loading applications...</p>}
      {!loading && error && <p className="py-12 text-center text-sm text-red-600">{error}</p>}
      {!loading && !error && applications.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700">
          No {status.toLowerCase()} doctor applications.
        </div>
      )}

      {!loading && !error && applications.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2">
          {applications.map((doctor) => (
            <article key={doctor.id} className="card space-y-4 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-bold text-slate-900 dark:text-white">{doctor.user.fullName}</h2>
                  <p className="text-sm text-slate-500">{doctor.user.email} · {doctor.user.phone || 'No phone provided'}</p>
                  <p className="mt-1 text-sm font-medium text-primary-600">
                    {doctor.specialization || 'Specialty not provided'}
                    {doctor.department?.name ? ` · ${doctor.department.name}` : ''}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {doctor.approvalStatus}
                </span>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-400">License</dt><dd className="font-medium text-slate-700 dark:text-slate-200">{doctor.licenseNumber || 'Not provided'}</dd></div>
                <div><dt className="text-slate-400">Experience</dt><dd className="font-medium text-slate-700 dark:text-slate-200">{doctor.experience ? `${doctor.experience} years` : 'Not provided'}</dd></div>
                <div><dt className="text-slate-400">Qualifications</dt><dd className="font-medium text-slate-700 dark:text-slate-200">{Array.isArray(doctor.qualifications) ? doctor.qualifications.join(', ') : 'Not provided'}</dd></div>
                <div><dt className="text-slate-400">Consultation fee</dt><dd className="font-medium text-slate-700 dark:text-slate-200">{doctor.consultationFee ? `NPR ${doctor.consultationFee}` : 'Not provided'}</dd></div>
              </dl>

              {doctor.bio && <p className="text-sm text-slate-600 dark:text-slate-300">{doctor.bio}</p>}

              <div className="flex flex-wrap gap-2">
                {(Array.isArray(doctor.certificates) ? doctor.certificates : []).map((certificate, index) => (
                  <a
                    key={certificate.publicId || certificate.url || index}
                    href={certificate.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-primary-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-primary-300"
                  >
                    Certificate {index + 1}<ExternalLink className="h-3 w-3" />
                  </a>
                ))}
                {(!Array.isArray(doctor.certificates) || doctor.certificates.length === 0) && (
                  <span className="text-xs text-slate-400">No certificates uploaded</span>
                )}
              </div>

              {status === 'PENDING' && (
                <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => handleReview(doctor.id, 'REJECTED')}
                    disabled={reviewingId === doctor.id}
                    className="btn btn-secondary btn-sm"
                  >
                    <X className="h-4 w-4" /> Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview(doctor.id, 'APPROVED')}
                    disabled={reviewingId === doctor.id}
                    className="btn btn-primary btn-sm"
                  >
                    <BadgeCheck className="h-4 w-4" /> Approve
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminDoctors;
