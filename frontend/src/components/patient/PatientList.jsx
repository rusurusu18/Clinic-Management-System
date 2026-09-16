import React, { useEffect, useState } from 'react'
import {
    FiSearch,
    FiRefreshCw,
    FiTrash2,
    FiEye,
    FiEdit,
    FiChevronLeft,
    FiChevronRight,
    FiUsers,
} from "react-icons/fi"
import toast from "react-hot-toast"
import { useSelector } from 'react-redux'
import {
    getAllPatients,
    deletePatient,
} from '../../services/patientServices.js'

const PatientList = () => {

    const { user } = useSelector((state) => state.auth)

    const [patients, setPatients] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
    })

    const [search, setSearch] = useState('')
    const [gender, setGender] = useState('')
    const [bloodGroup, setBloodGroup] = useState('')


    // =========================================================
    // FETCH PATIENTS
    // =========================================================

    const fetchPatients = async (params = {}) => {

        setLoading(true)
        setError(null)

        try {

            const data = await getAllPatients({
                page: pagination.page,
                limit: pagination.limit,
                search,
                gender,
                bloodGroup,
                ...params,
            })

            setPatients(data.patients || data)

            if (data.pagination) {
                setPagination(data.pagination)
            }

        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Failed to fetch patients"

            setError(message)
            toast.error(message)

        } finally {
            setLoading(false)
        }
    }


    // =========================================================
    // INITIAL FETCH / PAGE CHANGE
    // =========================================================

    useEffect(() => {
        fetchPatients()
    }, [pagination.page])


    // =========================================================
    // HANDLE SEARCH
    // =========================================================

    const handleSearch = (e) => {

        e.preventDefault()

        setPagination((p) => ({
            ...p,
            page: 1,
        }))

        fetchPatients({
            page: 1,
            search,
            gender,
            bloodGroup,
        })
    }


    // =========================================================
    // HANDLE RESET
    // =========================================================

    const handleReset = () => {

        setSearch('')
        setGender('')
        setBloodGroup('')

        setPagination((p) => ({
            ...p,
            page: 1,
        }))

        fetchPatients({
            page: 1,
            search: '',
            gender: '',
            bloodGroup: '',
        })
    }


    // =========================================================
    // HANDLE DELETE
    // =========================================================

    const handleDelete = async (patientId) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this patient?"
        )

        if (!confirmDelete) return

        try {

            setLoading(true)

            await deletePatient(patientId)

            toast.success("Patient deleted successfully")

            // Remove deleted patient from current list
            setPatients((prevPatients) =>
                prevPatients.filter(
                    (patient) =>
                        patient.id !== patientId &&
                        patient._id !== patientId
                )
            )

            // Update total count
            setPagination((prev) => ({
                ...prev,
                total: Math.max(0, prev.total - 1),
            }))

        } catch (error) {

            const message =
                error.response?.data?.message ||
                "Failed to delete patient"

            toast.error(message)

        } finally {
            setLoading(false)
        }
    }


    // =========================================================
    // HANDLE PAGE CHANGE
    // =========================================================

    const handlePageChange = (newPage) => {

        if (newPage < 1) return

        if (
            pagination.totalPages &&
            newPage > pagination.totalPages
        ) {
            return
        }

        setPagination((prev) => ({
            ...prev,
            page: newPage,
        }))
    }


    // =========================================================
    // VIEW PATIENT
    // =========================================================

    const handleView = (patientId) => {
        console.log("View patient:", patientId)

        // Later you can navigate to:
        // navigate(`/patients/${patientId}`)
    }


    // =========================================================
    // EDIT PATIENT
    // =========================================================

    const handleEdit = (patientId) => {
        console.log("Edit patient:", patientId)

        // Later you can navigate to:
        // navigate(`/patients/edit/${patientId}`)
    }


    // =========================================================
    // GET PATIENT ID
    // =========================================================

    const getPatientId = (patient) => {
        return patient.id || patient._id
    }


    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">

            {/* =====================================================
                HEADER
            ====================================================== */}

            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                <div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-100">
                            <FiUsers className="text-xl text-blue-600" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">
                                Patients
                            </h1>

                            <p className="text-sm text-gray-500">
                                Manage and view all registered patients
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => fetchPatients()}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <FiRefreshCw
                        className={loading ? "animate-spin" : ""}
                    />
                    Refresh
                </button>

            </div>


            {/* =====================================================
                SEARCH & FILTERS
            ====================================================== */}

            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">

                <form
                    onSubmit={handleSearch}
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4"
                >

                    {/* Search */}

                    <div className="relative lg:col-span-1">

                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search patient..."
                            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />

                    </div>


                    {/* Gender */}

                    <div>

                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >

                            <option value="">
                                All Genders
                            </option>

                            <option value="MALE">
                                Male
                            </option>

                            <option value="FEMALE">
                                Female
                            </option>

                            <option value="OTHER">
                                Other
                            </option>

                        </select>

                    </div>


                    {/* Blood Group */}

                    <div>

                        <select
                            value={bloodGroup}
                            onChange={(e) =>
                                setBloodGroup(e.target.value)
                            }
                            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        >

                            <option value="">
                                All Blood Groups
                            </option>

                            <option value="A_POSITIVE">A+</option>
                            <option value="A_NEGATIVE">A-</option>
                            <option value="B_POSITIVE">B+</option>
                            <option value="B_NEGATIVE">B-</option>
                            <option value="AB_POSITIVE">AB+</option>
                            <option value="AB_NEGATIVE">AB-</option>
                            <option value="O_POSITIVE">O+</option>
                            <option value="O_NEGATIVE">O-</option>

                        </select>

                    </div>


                    {/* Buttons */}

                    <div className="flex gap-2">

                        <button
                            type="submit"
                            disabled={loading}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
                        >
                            <FiSearch />
                            Search
                        </button>

                        <button
                            type="button"
                            onClick={handleReset}
                            className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
                        >
                            <FiRefreshCw />
                            Reset
                        </button>

                    </div>

                </form>

            </div>


            {/* =====================================================
                ERROR
            ====================================================== */}

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}


            {/* =====================================================
                PATIENT TABLE
            ====================================================== */}

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                {/* Table Header */}

                <div className="flex items-center justify-between border-b border-gray-200 px-4 py-4">

                    <div>
                        <h2 className="font-semibold text-gray-800">
                            Patient List
                        </h2>

                        <p className="text-sm text-gray-500">
                            {pagination.total || patients.length} patients found
                        </p>
                    </div>

                </div>


                {/* Loading */}

                {loading ? (

                    <div className="flex min-h-[300px] items-center justify-center">

                        <div className="flex flex-col items-center gap-3">

                            <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>

                            <p className="text-sm text-gray-500">
                                Loading patients...
                            </p>

                        </div>

                    </div>

                ) : patients.length === 0 ? (

                    /* Empty State */

                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4">

                        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">

                            <FiUsers className="text-2xl text-gray-400" />

                        </div>

                        <h3 className="font-semibold text-gray-700">
                            No patients found
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Try changing your search or filters.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px]">

                            <thead className="bg-gray-50">

                                <tr>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Patient
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Email
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Phone
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Gender
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Blood Group
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-gray-200">

                                {patients.map((patient) => {

                                    const patientId = getPatientId(patient)

                                    return (

                                        <tr
                                            key={patientId}
                                            className="transition hover:bg-gray-50"
                                        >

                                            {/* Patient */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 font-semibold text-blue-600">

                                                        {patient.fullName
                                                            ?.charAt(0)
                                                            ?.toUpperCase() || "P"}

                                                    </div>

                                                    <div>

                                                        <p className="font-medium text-gray-800">
                                                            {patient.fullName || "N/A"}
                                                        </p>

                                                        <p className="text-xs text-gray-500">
                                                            ID: {patientId || "N/A"}
                                                        </p>

                                                    </div>

                                                </div>

                                            </td>


                                            {/* Email */}

                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {patient.email || "N/A"}
                                            </td>


                                            {/* Phone */}

                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                {patient.phone || "N/A"}
                                            </td>


                                            {/* Gender */}

                                            <td className="px-4 py-4">

                                                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                    {patient.gender || "N/A"}
                                                </span>

                                            </td>


                                            {/* Blood Group */}

                                            <td className="px-4 py-4">

                                                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
                                                    {patient.bloodGroup || "N/A"}
                                                </span>

                                            </td>


                                            {/* Actions */}

                                            <td className="px-4 py-4">

                                                <div className="flex items-center justify-center gap-2">

                                                    {/* View */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleView(patientId)
                                                        }
                                                        title="View Patient"
                                                        className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50"
                                                    >
                                                        <FiEye />
                                                    </button>


                                                    {/* Edit */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleEdit(patientId)
                                                        }
                                                        title="Edit Patient"
                                                        className="rounded-lg p-2 text-green-600 transition hover:bg-green-50"
                                                    >
                                                        <FiEdit />
                                                    </button>


                                                    {/* Delete */}

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(patientId)
                                                        }
                                                        title="Delete Patient"
                                                        className="rounded-lg p-2 text-red-600 transition hover:bg-red-50"
                                                    >
                                                        <FiTrash2 />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    )

                                })}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* =================================================
                    PAGINATION
                ================================================== */}

                {patients.length > 0 && (
                    <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">

                        {/* Showing */}

                        <p className="text-sm text-gray-500">

                            Showing page{" "}

                            <span className="font-medium text-gray-700">
                                {pagination.page}
                            </span>

                            {" "}of{" "}

                            <span className="font-medium text-gray-700">
                                {pagination.totalPages || 1}
                            </span>

                        </p>


                        {/* Pagination Buttons */}

                        <div className="flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() =>
                                    handlePageChange(
                                        pagination.page - 1
                                    )
                                }
                                disabled={
                                    pagination.page === 1 ||
                                    loading
                                }
                                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <FiChevronLeft />
                                Previous
                            </button>


                            {/* Page Numbers */}

                            <div className="hidden items-center gap-1 sm:flex">

                                {Array.from(
                                    {
                                        length:
                                            pagination.totalPages || 1,
                                    },
                                    (_, index) => index + 1
                                ).map((pageNumber) => (

                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() =>
                                            handlePageChange(
                                                pageNumber
                                            )
                                        }
                                        className={`h-9 min-w-9 rounded-lg px-3 text-sm font-medium transition ${
                                            pagination.page === pageNumber
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>

                                ))}

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    handlePageChange(
                                        pagination.page + 1
                                    )
                                }
                                disabled={
                                    pagination.page >=
                                        pagination.totalPages ||
                                    loading
                                }
                                className="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                Next
                                <FiChevronRight />
                            </button>

                        </div>

                    </div>
                )}

            </div>

        </div>
    )
}

export default PatientList

