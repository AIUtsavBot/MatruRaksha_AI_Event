import React, { useState, useEffect } from 'react'
import { supabase } from '../services/auth.js'
import {
    Save, Loader, AlertCircle, CheckCircle, Calendar,
    Pill, Apple, Heart, Plus, Trash2, Clock, Activity,
    Thermometer, Droplet, Scale
} from 'lucide-react'

export default function ConsultationForm({ motherId, doctorId, doctorName, onSave }) {
    const [loading, setLoading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    // Form state - Health Status & Vitals
    const [healthStatus, setHealthStatus] = useState('')
    const [systolicBP, setSystolicBP] = useState('')
    const [diastolicBP, setDiastolicBP] = useState('')
    const [heartRate, setHeartRate] = useState('')
    const [bloodSugar, setBloodSugar] = useState('')
    const [hemoglobin, setHemoglobin] = useState('')
    const [weight, setWeight] = useState('')

    // Next Consultation
    const [nextConsultationDate, setNextConsultationDate] = useState('')
    const [nextConsultationTime, setNextConsultationTime] = useState('10:00')

    // Nutrition Plan
    const [nutritionPlan, setNutritionPlan] = useState('')
    const [trimester, setTrimester] = useState(1)

    // Medications list
    const [medications, setMedications] = useState([
        { medication: '', dosage: '', startDate: '', endDate: '', schedule: '' }
    ])

    // Previous consultations for reference
    const [previousConsultations, setPreviousConsultations] = useState([])
    const [previousVitals, setPreviousVitals] = useState(null)

    // Load previous data
    useEffect(() => {
        if (motherId) {
            loadPreviousData()
        }
    }, [motherId])

    const loadPreviousData = async () => {
        setLoading(true)
        try {
            // Load previous health metrics (vitals)
            const { data: metricsData } = await supabase
                .from('health_metrics')
                .select('*')
                .eq('mother_id', motherId)
                .order('created_at', { ascending: false })
                .limit(1)

            if (metricsData && metricsData[0]) {
                setPreviousVitals(metricsData[0])
                // Pre-fill with previous values for reference
                if (metricsData[0].notes) setHealthStatus(metricsData[0].notes)
            }

            // Load previous nutrition plans
            const { data: nutritionData } = await supabase
                .from('nutrition_plans')
                .select('*')
                .eq('mother_id', motherId)
                .order('created_at', { ascending: false })
                .limit(1)

            if (nutritionData && nutritionData[0]) {
                setNutritionPlan(nutritionData[0].plan || '')
                setTrimester(nutritionData[0].trimester || 1)
            }

            // Load previous prescriptions
            const { data: prescriptionData } = await supabase
                .from('prescriptions')
                .select('*')
                .eq('mother_id', motherId)
                .order('created_at', { ascending: false })
                .limit(5)

            if (prescriptionData && prescriptionData.length > 0) {
                setPreviousConsultations(prescriptionData)
            }

            // Load upcoming appointment
            const { data: appointmentData } = await supabase
                .from('appointments')
                .select('*')
                .eq('mother_id', motherId)
                .gte('appointment_date', new Date().toISOString())
                .order('appointment_date', { ascending: true })
                .limit(1)

            if (appointmentData && appointmentData[0]) {
                const apptDate = new Date(appointmentData[0].appointment_date)
                setNextConsultationDate(apptDate.toISOString().split('T')[0])
                setNextConsultationTime(apptDate.toTimeString().slice(0, 5))
            }

        } catch (err) {
            console.error('Error loading previous data:', err)
        } finally {
            setLoading(false)
        }
    }

    const addMedication = () => {
        setMedications([...medications, { medication: '', dosage: '', startDate: '', endDate: '', schedule: '' }])
    }

    const removeMedication = (index) => {
        if (medications.length > 1) {
            setMedications(medications.filter((_, i) => i !== index))
        }
    }

    const updateMedication = (index, field, value) => {
        const updated = [...medications]
        updated[index][field] = value
        setMedications(updated)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSaving(true)
        setError('')
        setSuccess('')

        try {
            // 1. Save health metrics (vitals + health status) to health_metrics table
            const hasVitals = systolicBP || diastolicBP || heartRate || bloodSugar || hemoglobin || weight || healthStatus
            if (hasVitals) {
                const healthMetricsRecord = {
                    id: crypto.randomUUID(),
                    mother_id: motherId,
                    weight_kg: weight ? parseFloat(weight) : null,
                    blood_pressure_systolic: systolicBP ? parseInt(systolicBP) : null,
                    blood_pressure_diastolic: diastolicBP ? parseInt(diastolicBP) : null,
                    hemoglobin: hemoglobin ? parseFloat(hemoglobin) : null,
                    blood_sugar: bloodSugar ? parseFloat(bloodSugar) : null,
                    measured_at: new Date().toISOString(),
                    notes: healthStatus.trim() || null
                }

                const { error: metricsError } = await supabase
                    .from('health_metrics')
                    .insert(healthMetricsRecord)

                if (metricsError) throw new Error(`Health Metrics Error: ${metricsError.message}`)
            }

            // 2. Save prescriptions to prescriptions table
            const validMedications = medications.filter(m => m.medication.trim())
            if (validMedications.length > 0) {
                const prescriptionRecords = validMedications.map(med => ({
                    mother_id: motherId,
                    medication: med.medication.trim(),
                    dosage: med.dosage.trim() || null,
                    start_date: med.startDate || null,
                    end_date: med.endDate || null,
                    schedule: med.schedule ? { instructions: med.schedule } : null
                }))

                const { error: prescriptionError } = await supabase
                    .from('prescriptions')
                    .insert(prescriptionRecords)

                if (prescriptionError) throw new Error(`Prescription Error: ${prescriptionError.message}`)
            }

            // 3. Save nutrition plan to nutrition_plans table
            if (nutritionPlan.trim()) {
                const { error: nutritionError } = await supabase
                    .from('nutrition_plans')
                    .insert({
                        mother_id: motherId,
                        plan: nutritionPlan.trim(),
                        trimester: trimester,
                        language: 'en'
                    })

                if (nutritionError) throw new Error(`Nutrition Plan Error: ${nutritionError.message}`)
            }

            // 4. Save next consultation appointment with IST timezone
            if (nextConsultationDate) {
                // Create date string with IST timezone offset (+05:30)
                // This ensures the time is stored exactly as selected, not converted to UTC
                const appointmentDateTimeIST = `${nextConsultationDate}T${nextConsultationTime}:00+05:30`

                const { error: appointmentError } = await supabase
                    .from('appointments')
                    .insert({
                        mother_id: motherId,
                        facility: doctorName || 'Doctor Consultation',
                        appointment_date: appointmentDateTimeIST,
                        status: 'scheduled',
                        appointment_type: 'consultation',
                        notes: `Scheduled by Dr. ${doctorName || 'Unknown'}`
                    })

                if (appointmentError) throw new Error(`Appointment Error: ${appointmentError.message}`)
            }

            setSuccess('Consultation details saved successfully!')

            // Reset form for new entry
            setSystolicBP('')
            setDiastolicBP('')
            setHeartRate('')
            setBloodSugar('')
            setHemoglobin('')
            setWeight('')
            setMedications([{ medication: '', dosage: '', startDate: '', endDate: '', schedule: '' }])

            // Reload previous data
            await loadPreviousData()

            if (onSave) onSave()

        } catch (err) {
            console.error('Error saving consultation:', err)
            setError(err.message || 'Failed to save consultation details')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <Loader className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-3" />
                    <p className="text-gray-600">Loading consultation data...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="h-full overflow-y-auto p-6 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <p className="text-green-800 font-medium">{success}</p>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {/* Vital Signs Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-red-500" />
                        Vital Signs
                    </h3>

                    {/* Previous Vitals Reference */}
                    {previousVitals && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-sm">
                            <p className="font-medium text-blue-800 mb-1">Previous Reading ({new Date(previousVitals.measured_at || previousVitals.created_at).toLocaleDateString()}):</p>
                            <div className="flex flex-wrap gap-3 text-blue-700">
                                {previousVitals.blood_pressure_systolic && previousVitals.blood_pressure_diastolic && (
                                    <span>BP: {previousVitals.blood_pressure_systolic}/{previousVitals.blood_pressure_diastolic} mmHg</span>
                                )}
                                {previousVitals.blood_sugar && <span>Sugar: {previousVitals.blood_sugar} mg/dL</span>}
                                {previousVitals.hemoglobin && <span>Hb: {previousVitals.hemoglobin} g/dL</span>}
                                {previousVitals.weight_kg && <span>Weight: {previousVitals.weight_kg} kg</span>}
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {/* Blood Pressure */}
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <Heart className="w-4 h-4 text-red-500" />
                                Blood Pressure (mmHg)
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="number"
                                    value={systolicBP}
                                    onChange={(e) => setSystolicBP(e.target.value)}
                                    placeholder="Systolic"
                                    min="60"
                                    max="250"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                <span className="text-gray-500 font-bold">/</span>
                                <input
                                    type="number"
                                    value={diastolicBP}
                                    onChange={(e) => setDiastolicBP(e.target.value)}
                                    placeholder="Diastolic"
                                    min="40"
                                    max="150"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                            </div>
                        </div>

                        {/* Heart Rate */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <Activity className="w-4 h-4 text-pink-500" />
                                Heart Rate (bpm)
                            </label>
                            <input
                                type="number"
                                value={heartRate}
                                onChange={(e) => setHeartRate(e.target.value)}
                                placeholder="e.g., 72"
                                min="40"
                                max="200"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Blood Sugar / Glucose */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <Droplet className="w-4 h-4 text-orange-500" />
                                Blood Sugar (mg/dL)
                            </label>
                            <input
                                type="number"
                                value={bloodSugar}
                                onChange={(e) => setBloodSugar(e.target.value)}
                                placeholder="e.g., 95"
                                min="20"
                                max="600"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Hemoglobin */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <Thermometer className="w-4 h-4 text-purple-500" />
                                Hemoglobin (g/dL)
                            </label>
                            <input
                                type="number"
                                value={hemoglobin}
                                onChange={(e) => setHemoglobin(e.target.value)}
                                placeholder="e.g., 12.5"
                                min="4"
                                max="20"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>

                        {/* Weight */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                <Scale className="w-4 h-4 text-blue-500" />
                                Weight (kg)
                            </label>
                            <input
                                type="number"
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                                placeholder="e.g., 65"
                                min="30"
                                max="200"
                                step="0.1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Health Status Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Heart className="w-5 h-5 text-red-500" />
                        Health Status & Observations
                    </h3>
                    <textarea
                        value={healthStatus}
                        onChange={(e) => setHealthStatus(e.target.value)}
                        placeholder="Enter patient's current health status, observations, symptoms, concerns, and clinical notes..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                    />
                </div>

                {/* Next Consultation Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        Next Consultation Schedule
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                            <input
                                type="date"
                                value={nextConsultationDate}
                                onChange={(e) => setNextConsultationDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                                <input
                                    type="time"
                                    value={nextConsultationTime}
                                    onChange={(e) => setNextConsultationTime(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nutrition Plan Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Apple className="w-5 h-5 text-green-500" />
                        Nutrition Plan
                    </h3>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Trimester</label>
                        <select
                            value={trimester}
                            onChange={(e) => setTrimester(Number(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value={1}>First Trimester (Week 1-12)</option>
                            <option value={2}>Second Trimester (Week 13-26)</option>
                            <option value={3}>Third Trimester (Week 27-40)</option>
                        </select>
                    </div>
                    <textarea
                        value={nutritionPlan}
                        onChange={(e) => setNutritionPlan(e.target.value)}
                        placeholder="Enter dietary recommendations, foods to include, foods to avoid, supplements..."
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                    />
                </div>

                {/* Medication Plan Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Pill className="w-5 h-5 text-purple-500" />
                            Medication Plan
                        </h3>
                        <button
                            type="button"
                            onClick={addMedication}
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Medication
                        </button>
                    </div>

                    <div className="space-y-4">
                        {medications.map((med, index) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-700">Medication #{index + 1}</span>
                                    {medications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(index)}
                                            className="text-red-600 hover:text-red-700 p-1"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <input
                                            type="text"
                                            value={med.medication}
                                            onChange={(e) => updateMedication(index, 'medication', e.target.value)}
                                            placeholder="Medication name (e.g., Folic Acid, Iron Supplement)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={med.dosage}
                                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                            placeholder="Dosage (e.g., 400mcg)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <input
                                            type="text"
                                            value={med.schedule}
                                            onChange={(e) => updateMedication(index, 'schedule', e.target.value)}
                                            placeholder="Schedule (e.g., Once daily)"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                                        <input
                                            type="date"
                                            value={med.startDate}
                                            onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                                        <input
                                            type="date"
                                            value={med.endDate}
                                            onChange={(e) => updateMedication(index, 'endDate', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Previous Prescriptions Reference */}
                {previousConsultations.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Previous Prescriptions</h3>
                        <div className="space-y-2">
                            {previousConsultations.map((presc, idx) => (
                                <div key={presc.id || idx} className="bg-gray-50 p-3 rounded-lg text-sm flex justify-between items-center">
                                    <div>
                                        <span className="font-medium text-gray-900">{presc.medication}</span>
                                        {presc.dosage && <span className="text-gray-600 ml-2">- {presc.dosage}</span>}
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {presc.created_at && new Date(presc.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] disabled:scale-100 shadow-lg"
                >
                    {saving ? (
                        <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Saving Consultation Details...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            Save Consultation Details
                        </>
                    )}
                </button>
            </form>
        </div>
    )
}
