import React, { useEffect, useState } from 'react'
import {
    FiArrowLeft,
    FiUser,
    FiPhone,
    FiMail,
    FiCalendar,
    FiMapPin,
    FiDroplet,
    FiRefreshCw,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import { getPatientById } from '../../services/patientServices.js'


const PatientDetails = () => {

    const { id } = useParams()
    const navigate = useNavigate()

    const [patient, setPatient] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)


    // ============================================================
    // FETCH PATIENT
    // ============================================================

    const fetchPatient = async () => {

        setLoading(true)
        setError(null)

        try {

            const data = await getPatientById(id)

            setPatient(data)

        } catch (error) {

            const message =
                error.response?.data?.message ||
                'Failed to fetch patient details'

            setError(message)

            toast.error(message)

        } finally {

            setLoading(false)

        }
    }


    // ============================================================
    // INITIAL FETCH
    // ============================================================

    useEffect(() => {

        if (id) {
            fetchPatient()
        }

    }, [id])


    // ============================================================
    // LOADING
    // ============================================================

    if (loading) {

        return (
            <div className="flex min-h-[60vh] items-center justify-center">

                <div className="flex flex-col items-center gap-3">

                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="text-sm text-gray-500">
                        Loading patient details...
                    </p>

                </div>

            </div>
        )
    }


    // ============================================================
    // ERROR
    // ============================================================

    if (error || !patient) {

        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center">

                <div className="mb-4 rounded-full bg-red-100 p-4">
                    <FiUser className="text-2xl text-red-500" />
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                    Patient not found
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                    {error || 'Unable to load patient information.'}
                </p>

                <button
                    onClick={() => navigate(-1)}
                    className="mt-5 flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <FiArrowLeft />
                    Go Back
                </button>

            </div>
        )
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* ==================================================
                HEADER
            =================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <button
                        onClick={() => navigate(-1)}
                        className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 hover:bg-gray-100"
                    >
                        <FiArrowLeft />
                    </button>

                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">
                            Patient Details
                        </h1>

                        <p className="text-sm text-gray-500">
                            View complete patient information
                        </p>

                    </div>

                </div>


                <button
                    onClick={fetchPatient}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                    <FiRefreshCw />
                    Refresh
                </button>

            </div>


            {/* ==================================================
                PROFILE HEADER
            =================================================== */}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-blue-100 text-3xl font-bold text-blue-600">

                        {patient.fullName
                            ?.charAt(0)
                            ?.toUpperCase() || 'P'}

                    </div>


                    <div>

                        <h2 className="text-xl font-bold text-gray-800">
                            {patient.fullName || 'N/A'}
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            Patient ID: {patient.id || patient._id || 'N/A'}
                        </p>

                        {patient.email && (
                            <p className="mt-1 text-sm text-gray-500">
                                {patient.email}
                            </p>
                        )}

                    </div>

                </div>

            </div>


            {/* ==================================================
                PERSONAL INFORMATION
            =================================================== */}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-6 py-4">

                    <h2 className="font-semibold text-gray-800">
                        Personal Information
                    </h2>

                </div>


                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* Full Name */}

                    <InfoItem
                        icon={<FiUser />}
                        label="Full Name"
                        value={patient.fullName}
                    />


                    {/* Email */}

                    <InfoItem
                        icon={<FiMail />}
                        label="Email"
                        value={patient.email}
                    />


                    {/* Phone */}

                    <InfoItem
                        icon={<FiPhone />}
                        label="Phone"
                        value={patient.phone}
                    />


                    {/* Gender */}

                    <InfoItem
                        icon={<FiUser />}
                        label="Gender"
                        value={patient.gender}
                    />


                    {/* Date of Birth */}

                    <InfoItem
                        icon={<FiCalendar />}
                        label="Date of Birth"
                        value={patient.dateOfBirth}
                    />


                    {/* Blood Group */}

                    <InfoItem
                        icon={<FiDroplet />}
                        label="Blood Group"
                        value={patient.bloodGroup}
                    />


                    {/* Address */}

                    <InfoItem
                        icon={<FiMapPin />}
                        label="Address"
                        value={patient.address}
                    />

                </div>

            </div>


            {/* ==================================================
                ADDITIONAL INFORMATION
            =================================================== */}

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="border-b border-gray-200 px-6 py-4">

                    <h2 className="font-semibold text-gray-800">
                        Additional Information
                    </h2>

                </div>


                <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">

                    <InfoItem
                        label="Created At"
                        value={
                            patient.createdAt
                                ? new Date(
                                    patient.createdAt
                                ).toLocaleDateString()
                                : null
                        }
                    />

                    <InfoItem
                        label="Updated At"
                        value={
                            patient.updatedAt
                                ? new Date(
                                    patient.updatedAt
                                ).toLocaleDateString()
                                : null
                        }
                    />

                </div>

            </div>

        </div>
    )
}


// ============================================================
// REUSABLE INFO ITEM
// ============================================================

const InfoItem = ({
    icon,
    label,
    value,
}) => {

    return (
        <div className="flex items-start gap-3">

            {icon && (
                <div className="mt-0.5 rounded-lg bg-blue-50 p-2 text-blue-600">
                    {icon}
                </div>
            )}

            <div>

                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    {label}
                </p>

                <p className="mt-1 text-sm font-medium text-gray-700">
                    {value || 'Not provided'}
                </p>

            </div>

        </div>
    )
}


export default PatientDetails

