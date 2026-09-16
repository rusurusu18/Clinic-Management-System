import React, { useEffect, useState } from 'react'
import {
    FiArrowLeft,
    FiSave,
    FiUpload,
    FiX,
    FiUser,
    FiPhone,
    FiMail,
    FiCalendar,
    FiMapPin,
    FiDroplet,
    FiFileText,
} from 'react-icons/fi'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

import {
    getPatientById,
    createPatient,
    updatePatient,
} from '../../services/patientServices.js'


const PatientForm = () => {

    const navigate = useNavigate()
    const { id } = useParams()

    const isEditMode = Boolean(id)


    // ============================================================
    // FORM STATE
    // ============================================================

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        bloodGroup: '',
        address: '',
    })


    // ============================================================
    // FILE STATE
    // ============================================================

    const [documents, setDocuments] = useState([])


    // ============================================================
    // LOADING STATES
    // ============================================================

    const [loading, setLoading] = useState(false)
    const [fetchingPatient, setFetchingPatient] = useState(false)


    // ============================================================
    // ERROR STATE
    // ============================================================

    const [errors, setErrors] = useState({})


    // ============================================================
    // FETCH PATIENT FOR EDIT
    // ============================================================

    const fetchPatient = async () => {

        if (!id) return

        setFetchingPatient(true)

        try {

            const patient = await getPatientById(id)

            setFormData({
                fullName: patient.fullName || '',
                email: patient.email || '',
                phone: patient.phone || '',
                dateOfBirth: patient.dateOfBirth
                    ? patient.dateOfBirth.split('T')[0]
                    : '',
                gender: patient.gender || '',
                bloodGroup: patient.bloodGroup || '',
                address: patient.address || '',
            })

        } catch (error) {

            const message =
                error.response?.data?.message ||
                'Failed to load patient information'

            toast.error(message)

            navigate(-1)

        } finally {

            setFetchingPatient(false)

        }
    }


    // ============================================================
    // INITIAL FETCH
    // ============================================================

    useEffect(() => {

        if (isEditMode) {
            fetchPatient()
        }

    }, [id])


    // ============================================================
    // HANDLE INPUT CHANGE
    // ============================================================

    const handleChange = (e) => {

        const {
            name,
            value,
        } = e.target

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))


        // Remove field error when user starts typing

        if (errors[name]) {

            setErrors((prev) => {

                const updatedErrors = {
                    ...prev,
                }

                delete updatedErrors[name]

                return updatedErrors

            })

        }
    }


    // ============================================================
    // HANDLE FILE CHANGE
    // ============================================================

    const handleFileChange = (e) => {

        const selectedFiles = Array.from(
            e.target.files || []
        )

        setDocuments((prev) => [
            ...prev,
            ...selectedFiles,
        ])

    }


    // ============================================================
    // REMOVE SELECTED FILE
    // ============================================================

    const removeFile = (index) => {

        setDocuments((prev) =>
            prev.filter((_, fileIndex) => fileIndex !== index)
        )

    }


    // ============================================================
    // VALIDATE FORM
    // ============================================================

    const validateForm = () => {

        const newErrors = {}


        // Full name

        if (!formData.fullName.trim()) {

            newErrors.fullName =
                'Full name is required'

        } else if (
            formData.fullName.trim().length < 2
        ) {

            newErrors.fullName =
                'Full name must contain at least 2 characters'

        }


        // Email

        if (!formData.email.trim()) {

            newErrors.email =
                'Email is required'

        }


        // Phone

        if (!formData.phone.trim()) {

            newErrors.phone =
                'Phone number is required'

        }


        // Date of birth

        if (!formData.dateOfBirth) {

            newErrors.dateOfBirth =
                'Date of birth is required'

        }


        // Gender

        if (!formData.gender) {

            newErrors.gender =
                'Please select gender'

        }


        // Blood group

        if (!formData.bloodGroup) {

            newErrors.bloodGroup =
                'Please select blood group'

        }


        // Address

        if (!formData.address.trim()) {

            newErrors.address =
                'Address is required'

        }


        setErrors(newErrors)

        return Object.keys(newErrors).length === 0

    }


    // ============================================================
    // HANDLE SUBMIT
    // ============================================================

    const handleSubmit = async (e) => {

        e.preventDefault()


        // Client-side validation

        if (!validateForm()) {

            toast.error(
                'Please fix the errors in the form'
            )

            return

        }


        setLoading(true)


        try {

            // ====================================================
            // CREATE FORMDATA
            // ====================================================

            const data = new FormData()


            // Add normal fields

            Object.entries(formData).forEach(
                ([key, value]) => {

                    if (
                        value !== undefined &&
                        value !== null
                    ) {

                        data.append(
                            key,
                            value
                        )

                    }

                }
            )


            // Add documents

            documents.forEach((file) => {

                data.append(
                    'documents',
                    file
                )

            })


            // ====================================================
            // CREATE
            // ====================================================

            if (!isEditMode) {

                const createdPatient =
                    await createPatient(data)

                toast.success(
                    'Patient created successfully'
                )


                // If API returns the newly created patient

                const createdId =
                    createdPatient?.id ||
                    createdPatient?._id


                if (createdId) {

                    navigate(
                        `/staff/patients/${createdId}`
                    )

                } else {

                    navigate('/staff/patients')

                }

            }


            // ====================================================
            // UPDATE
            // ====================================================

            else {

                await updatePatient(
                    id,
                    data
                )

                toast.success(
                    'Patient updated successfully'
                )


                navigate(
                    `/staff/patients/${id}`
                )

            }

        } catch (error) {

            console.error(
                'Patient form error:',
                error
            )


            const responseData =
                error.response?.data


            const message =
                responseData?.message ||
                'Something went wrong. Please try again.'


            // ====================================================
            // HANDLE ZOD VALIDATION ERRORS
            // ====================================================

            if (
                responseData?.errors &&
                Array.isArray(responseData.errors)
            ) {

                const validationErrors = {}

                responseData.errors.forEach(
                    (errorItem) => {

                        const field =
                            errorItem.path?.[0]

                        if (field) {

                            validationErrors[field] =
                                errorItem.message

                        }

                    }
                )

                setErrors(validationErrors)

            }


            toast.error(message)

        } finally {

            setLoading(false)

        }

    }


    // ============================================================
    // LOADING EDIT FORM
    // ============================================================

    if (fetchingPatient) {

        return (

            <div className="flex min-h-[60vh] items-center justify-center">

                <div className="flex flex-col items-center gap-3">

                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

                    <p className="text-sm text-gray-500">
                        Loading patient information...
                    </p>

                </div>

            </div>

        )

    }


    // ============================================================
    // PAGE
    // ============================================================

    return (

        <div className="min-h-screen bg-gray-50 p-4 md:p-6">


            {/* ==================================================
                HEADER
            =================================================== */}

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-3">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="rounded-lg border border-gray-300 bg-white p-2 text-gray-600 transition hover:bg-gray-100"
                    >
                        <FiArrowLeft />
                    </button>


                    <div>

                        <h1 className="text-2xl font-bold text-gray-800">

                            {isEditMode
                                ? 'Edit Patient'
                                : 'Create Patient'}

                        </h1>


                        <p className="text-sm text-gray-500">

                            {isEditMode
                                ? 'Update patient information'
                                : 'Create a new patient profile'}

                        </p>

                    </div>

                </div>

            </div>


            {/* ==================================================
                FORM
            =================================================== */}

            <form
                onSubmit={handleSubmit}
                className="mx-auto max-w-5xl"
            >


                {/* ==================================================
                    PERSONAL INFORMATION
                =================================================== */}

                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-4">

                        <div className="flex items-center gap-2">

                            <FiUser className="text-blue-600" />

                            <h2 className="font-semibold text-gray-800">
                                Personal Information
                            </h2>

                        </div>

                    </div>


                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">


                        {/* Full Name */}

                        <div className="md:col-span-2">

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                Full Name
                                <span className="text-red-500">
                                    {' '}*
                                </span>

                            </label>


                            <div className="relative">

                                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Enter patient's full name"
                                    className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                                        errors.fullName
                                            ? 'border-red-500 focus:ring-2 focus:ring-red-100'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                />

                            </div>


                            {errors.fullName && (

                                <p className="mt-1 text-xs text-red-500">
                                    {errors.fullName}
                                </p>

                            )}

                        </div>


                        {/* Email */}

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                Email
                                <span className="text-red-500">
                                    {' '}*
                                </span>

                            </label>


                            <div className="relative">

                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="patient@example.com"
                                    className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                                        errors.email
                                            ? 'border-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                />

                            </div>


                            {errors.email && (

                                <p className="mt-1 text-xs text-red-500">
                                    {errors.email}
                                </p>

                            )}

                        </div>


                        {/* Phone */}

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                Phone
                                <span className="text-red-500">
                                    {' '}*
                                </span>

                            </label>


                            <div className="relative">

                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                    className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                                        errors.phone
                                            ? 'border-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                />

                            </div>


                            {errors.phone && (

                                <p className="mt-1 text-xs text-red-500">
                                    {errors.phone}
                                </p>

                            )}

                        </div>


                        {/* Date of Birth */}

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                Date of Birth
                                <span className="text-red-500">
                                    {' '}*
                                </span>

                            </label>


                            <div className="relative">

                                <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                                        errors.dateOfBirth
                                            ? 'border-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                />

                            </div>


                            {errors.dateOfBirth && (

                                <p className="mt-1 text-xs text-red-500">
                                    {errors.dateOfBirth}
                                </p>

                            )}

                        </div>


                        {/* Gender */}

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                Gender
                                <span className="text-red-500">
                                    {' '}*
                                </span>

                            </label>


                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition ${
                                    errors.gender
                                        ? 'border-red-500'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                }`}
                            >

                                <option value="">
                                    Select Gender
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


                            {errors.gender && (

                                <p className="mt-1 text-xs text-red-500">
                                    {errors.gender}
                                </p>

                            )}

                        </div>


                        {/* Blood Group */}

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                Blood Group
                                <span className="text-red-500">
                                    {' '}*
                                </span>

                            </label>


                            <div className="relative">

                                <FiDroplet className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                                <select
                                    name="bloodGroup"
                                    value={formData.bloodGroup}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                                        errors.bloodGroup
                                            ? 'border-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                >

                                    <option value="">
                                        Select Blood Group
                                    </option>

                                    <option value="A_POSITIVE">
                                        A+
                                    </option>

                                    <option value="A_NEGATIVE">
                                        A-
                                    </option>

                                    <option value="B_POSITIVE">
                                        B+
                                    </option>

                                    <option value="B_NEGATIVE">
                                        B-
                                    </option>

                                    <option value="AB_POSITIVE">
                                        AB+
                                    </option>

                                    <option value="AB_NEGATIVE">
                                        AB-
                                    </option>

                                    <option value="O_POSITIVE">
                                        O+
                                    </option>

                                    <option value="O_NEGATIVE">
                                        O-
                                    </option>

                                </select>

                            </div>


                            {errors.bloodGroup && (

                                <p className="mt-1 text-xs text-red-500">
                                    {errors.bloodGroup}
                                </p>

                            )}

                        </div>


                        {/* Address */}

                        <div className="md:col-span-2">

                            <label className="mb-1.5 block text-sm font-medium text-gray-700">

                                Address
                                <span className="text-red-500">
                                    {' '}*
                                </span>

                            </label>


                            <div className="relative">

                                <FiMapPin className="absolute left-3 top-3 text-gray-400" />

                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    placeholder="Enter patient's address"
                                    className={`w-full resize-none rounded-lg border py-2.5 pl-10 pr-3 text-sm outline-none transition ${
                                        errors.address
                                            ? 'border-red-500'
                                            : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
                                    }`}
                                />

                            </div>


                            {errors.address && (

                                <p className="mt-1 text-xs text-red-500">
                                    {errors.address}
                                </p>

                            )}

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    DOCUMENT UPLOAD
                =================================================== */}

                <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-4">

                        <div className="flex items-center gap-2">

                            <FiFileText className="text-blue-600" />

                            <h2 className="font-semibold text-gray-800">
                                Documents
                            </h2>

                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                            Upload patient documents if required.
                        </p>

                    </div>


                    <div className="p-6">

                        {/* Upload Area */}

                        <label
                            htmlFor="documents"
                            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-8 transition hover:border-blue-400 hover:bg-blue-50/30"
                        >

                            <div className="mb-3 rounded-full bg-blue-100 p-3">

                                <FiUpload className="text-xl text-blue-600" />

                            </div>


                            <p className="text-sm font-medium text-gray-700">
                                Click to upload documents
                            </p>


                            <p className="mt-1 text-xs text-gray-500">
                                You can select multiple files
                            </p>


                            <input
                                id="documents"
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="hidden"
                            />

                        </label>


                        {/* Selected Files */}

                        {documents.length > 0 && (

                            <div className="mt-4 space-y-2">

                                <p className="text-sm font-medium text-gray-700">
                                    Selected Documents
                                </p>


                                {documents.map(
                                    (file, index) => (

                                        <div
                                            key={`${file.name}-${index}`}
                                            className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2"
                                        >

                                            <div className="flex min-w-0 items-center gap-3">

                                                <FiFileText className="shrink-0 text-gray-500" />

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm text-gray-700">
                                                        {file.name}
                                                    </p>

                                                    <p className="text-xs text-gray-400">

                                                        {(
                                                            file.size /
                                                            1024
                                                        ).toFixed(1)}
                                                        {' '}KB

                                                    </p>

                                                </div>

                                            </div>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    removeFile(index)
                                                }
                                                className="ml-3 rounded-lg p-2 text-red-500 hover:bg-red-50"
                                                title="Remove file"
                                            >

                                                <FiX />

                                            </button>

                                        </div>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>


                {/* ==================================================
                    ACTION BUTTONS
                =================================================== */}

                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={loading}
                        className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {loading ? (

                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                                {isEditMode
                                    ? 'Updating...'
                                    : 'Creating...'}

                            </>

                        ) : (

                            <>
                                <FiSave />

                                {isEditMode
                                    ? 'Update Patient'
                                    : 'Create Patient'}

                            </>

                        )}

                    </button>

                </div>

            </form>

        </div>

    )
}


export default PatientForm

