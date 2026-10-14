import { useEffect, useMemo, useRef, useState } from 'react';
import { Activity, Download, FilePlus, FileText, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMyMedicalHistory } from '../../../services/medicalRecordService.js';
import { getPatientProfile, uploadMyPatientDocuments } from '../../../services/patientServices.js';
import { API_URL } from '../../../utils/constants.js';

const formatDate = (value) => {
  if (!value) return 'Date unavailable';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleDateString();
};

const formatSize = (size) => {
  if (!Number.isFinite(Number(size)) || Number(size) <= 0) return null;
  const megabytes = Number(size) / (1024 * 1024);
  return megabytes < 1 ? `${Math.max(1, Math.round(Number(size) / 1024))} KB` : `${megabytes.toFixed(1)} MB`;
};

const getDocumentUrl = (url) => {
  try {
    return new URL(url, API_URL).toString();
  } catch {
    return null;
  }
};

const PatientHistory = () => {
  const fileInputRef = useRef(null);
  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const [patientProfile, firstPage] = await Promise.all([
          getPatientProfile(),
          getMyMedicalHistory({ page: 1, limit: 100 }),
        ]);
        const totalPages = firstPage.pagination?.totalPages || 1;
        const remainingPages = await Promise.all(
          Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) =>
            getMyMedicalHistory({ page: index + 2, limit: 100 })
          )
        );
        if (isMounted) {
          setPatient(patientProfile);
          setRecords([
            ...(firstPage.records || []),
            ...remainingPages.flatMap((page) => page.records || []),
          ]);
        }
      } catch (error) {
        const message = error.response?.data?.message || error.message || 'Unable to load medical records.';
        if (isMounted) {
          setLoadError(message);
          toast.error(message);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const documents = useMemo(() => {
    const patientDocuments = (Array.isArray(patient?.documents) ? patient.documents : [])
      .filter((document) => document?.url)
      .map((document, index) => ({
        id: document.publicId || document.url || `patient-document-${index}`,
        name: document.originalName || document.name || 'Patient document',
        url: document.url,
        date: document.uploadedAt,
        category: document.format?.toUpperCase() || 'Patient document',
        size: document.size,
        doctor: 'Uploaded by you',
      }));

    const reportDocuments = records.flatMap((record) =>
      (Array.isArray(record.reports) ? record.reports : [])
        .filter((report) => report.fileUrl)
        .map((report) => ({
          id: report.id,
          name: report.name || 'Medical report',
          url: report.fileUrl,
          date: report.date || report.createdAt,
          category: report.type?.replaceAll('_', ' ') || 'Medical report',
          size: report.size,
          doctor: record.doctor?.user?.fullName || 'Clinic report',
        }))
    );

    return [...patientDocuments, ...reportDocuments].sort(
      (left, right) => new Date(right.date || 0).getTime() - new Date(left.date || 0).getTime()
    );
  }, [patient, records]);

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = '';
    if (!files.length) return;

    setUploading(true);
    try {
      const updatedPatient = await uploadMyPatientDocuments(files);
      setPatient(updatedPatient);
      toast.success('Documents uploaded successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload documents.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Blood Pressure</p>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">120 / 80 <span className="text-xs font-normal text-slate-400">mmHg</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Heart Rate</p>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">72 <span className="text-xs font-normal text-slate-400">BPM</span></p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold text-slate-500">Allergies</p>
              <p className="font-display text-lg font-bold text-slate-900 dark:text-white">Penicillin</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Medical Records &amp; Reports</h3>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.txt,.xlsx,.xls"
              className="hidden"
              onChange={handleUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !patient}
              className="flex items-center gap-2 rounded-xl bg-primary-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FilePlus className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>
        <p className="mb-3 text-xs text-slate-500">PDFs, images, and documents up to 10 MB each; up to 5 files per upload.</p>

        {loadError && (
          <p role="alert" className="mb-3 rounded-xl bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-900/20 dark:text-rose-300">
            {loadError}
          </p>
        )}

        <div className="space-y-3">
          {loading ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              Loading medical records...
            </p>
          ) : documents.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
              No documents available yet. Upload a document to add it to your medical history.
            </p>
          ) : documents.map((document) => {
            const url = getDocumentUrl(document.url);
            return (
              <div
                key={document.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex min-w-0 items-center gap-3.5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                    <FileText className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate font-bold text-slate-900 dark:text-white">{document.name}</h4>
                    <p className="text-xs text-slate-500">
                      {document.doctor} · {document.category} · {formatDate(document.date)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {formatSize(document.size) && (
                    <span className="hidden text-xs text-slate-400 sm:inline">{formatSize(document.size)}</span>
                  )}
                  {url ? (
                    <a
                      href={url}
                      download={document.name}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Download ${document.name}`}
                      title={`Download ${document.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400">File unavailable</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PatientHistory;
