'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import AuthButton from '@/components/AuthButton';

interface Exercise {
  id: string;
  name: string;
  category: string;
  instructions: string;
  reps: string;
  sets: string;
  duration: string;
}

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  notes?: string;
}

interface Program {
  id: string;
  patientId: string;
  exerciseIds: string[];
  frequency: string;
  startDate: string;
}

type Tab = 'exercises' | 'patients' | 'programs' | 'therapists';

export default function PhysitrackApp() {
  const [activeTab, setActiveTab] = useState<Tab>('exercises');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  // Form states
  const [newExercise, setNewExercise] = useState({ name: '', category: '', instructions: '', reps: '', sets: '', duration: '' });
  const [newPatient, setNewPatient] = useState({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', notes: '' });
  const [newProgram, setNewProgram] = useState({ patientId: '', exerciseIds: [] as string[], frequency: 'daily' });
  const [editingExercise, setEditingExercise] = useState<any>(null);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [therapists, setTherapists] = useState<any[]>([]);
  const [newTherapist, setNewTherapist] = useState({ firstname: '', lastname: '', email: '', clinic: '', permission: 'therapist' });
  const [editingTherapist, setEditingTherapist] = useState<any>(null);

  useEffect(() => {
    checkUser();
    fetchData();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (!user) {
      window.location.href = '/login';
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exercisesRes, patientsRes, programsRes, therapistsRes] = await Promise.all([
        fetch('/api/exercises'),
        fetch('/api/patients'),
        fetch('/api/programs'),
        fetch('/api/therapists'),
      ]);
      const exercisesData = exercisesRes.ok ? await exercisesRes.json() : [];
      setExercises(Array.isArray(exercisesData) ? exercisesData : []);

      const patientsData = patientsRes.ok ? await patientsRes.json() : [];
      setPatients(Array.isArray(patientsData) ? patientsData : []);

      const programsData = programsRes.ok ? await programsRes.json() : [];
      setPrograms(Array.isArray(programsData) ? programsData : []);

      const therapistsData = therapistsRes.ok ? await therapistsRes.json() : [];
      setTherapists(Array.isArray(therapistsData) ? therapistsData : []);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  };

  const addExercise = async () => {
    if (!newExercise.name) return;
    await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newExercise),
    });
    setNewExercise({ name: '', category: '', instructions: '', reps: '', sets: '', duration: '' });
    fetchData();
  };

  const updateExercise = async () => {
    if (!editingExercise || !editingExercise.name) return;
    await fetch('/api/exercises', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingExercise),
    });
    setEditingExercise(null);
    fetchData();
  };

  const addTherapist = async () => {
    if (!newTherapist.email) return;
    await fetch('/api/therapists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newTherapist),
    });
    setNewTherapist({ firstname: '', lastname: '', email: '', clinic: '', permission: 'therapist' });
    fetchData();
  };

  const updateTherapist = async () => {
    if (!editingTherapist || !editingTherapist.email) return;
    await fetch('/api/therapists', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingTherapist),
    });
    setEditingTherapist(null);
    fetchData();
  };

  const deleteTherapist = async (id: string) => {
    await fetch('/api/therapists?id=' + id, { method: 'DELETE' });
    fetchData();
  };

  const addPatient = async () => {
    if (!newPatient.firstName) return;
    const patientData = {
      firstName: newPatient.firstName,
      lastName: newPatient.lastName,
      email: newPatient.email,
      phone: newPatient.phone,
      dateOfBirth: newPatient.dateOfBirth,
      notes: newPatient.notes,
    };
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error('Failed to add patient:', error);
      alert('Failed to add patient: ' + (error?.error || 'Unknown error'));
      return;
    }
    setNewPatient({ firstName: '', lastName: '', email: '', phone: '', dateOfBirth: '', notes: '' });
    fetchData();
  };

  const updatePatient = async () => {
    if (!editingPatient || !editingPatient.id) return;
    const patientData = {
      id: editingPatient.id,
      firstName: editingPatient.firstName,
      lastName: editingPatient.lastName,
      email: editingPatient.email,
      phone: editingPatient.phone,
      dateOfBirth: editingPatient.dateOfBirth,
      notes: editingPatient.notes,
    };
    const res = await fetch('/api/patients', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData),
    });
    if (!res.ok) {
      const error = await res.json();
      console.error('Failed to update patient:', error);
      alert('Failed to update patient: ' + (error?.error || 'Unknown error'));
      return;
    }
    setEditingPatient(null);
    fetchData();
  };

  const addProgram = async () => {
    if (!newProgram.patientId || newProgram.exerciseIds.length === 0) return;
    await fetch('/api/programs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProgram),
    });
    setNewProgram({ patientId: '', exerciseIds: [], frequency: 'daily' });
    fetchData();
  };

  const deleteItem = async (type: string, id: string) => {
    await fetch(`/api/${type}?id=${id}`, { method: 'DELETE' });
    fetchData();
  };

  const toggleExerciseInProgram = (id: string) => {
    setNewProgram(prev => ({
      ...prev,
      exerciseIds: prev.exerciseIds.includes(id)
        ? prev.exerciseIds.filter(e => e !== id)
        : [...prev.exerciseIds, id]
    }));
  };

  const getPatientName = (id: string) => {
    const p = patients.find(p => p.id === id);
    return p ? `${p.firstName} ${p.lastName}`.trim() : 'Unknown';
  };
  const getExercise = (id: string) => exercises.find(e => e.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="bg-blue-600 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🏥 PhysioFlow
        </h1>
        <AuthButton />
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {(['exercises', 'patients', 'programs', 'therapists'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize ${activeTab === tab
              ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <main className="p-6">
        {/* Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="space-y-6">
            {/* Add Exercise Form */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Add Exercise</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Exercise name"
                  value={newExercise.name}
                  onChange={e => setNewExercise({ ...newExercise, name: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Category (e.g. Neck, Back)"
                  value={newExercise.category}
                  onChange={e => setNewExercise({ ...newExercise, category: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 5 min)"
                  value={newExercise.duration}
                  onChange={e => setNewExercise({ ...newExercise, duration: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Reps (e.g. 10)"
                  value={newExercise.reps}
                  onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Sets (e.g. 3)"
                  value={newExercise.sets}
                  onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <button
                  onClick={addExercise}
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <textarea
                placeholder="Instructions"
                value={newExercise.instructions}
                onChange={e => setNewExercise({ ...newExercise, instructions: e.target.value })}
                className="w-full mt-3 bg-slate-700 px-3 py-2 rounded text-white"
                rows={2}
              />
            </div>

            {/* Edit Exercise Form */}
            {editingExercise && (
              <div className="bg-slate-800 p-4 rounded-xl border-2 border-blue-500">
                <h2 className="text-lg font-semibold mb-4">Edit Exercise</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Exercise name"
                    value={editingExercise.name || ''}
                    onChange={e => setEditingExercise({ ...editingExercise, name: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={editingExercise.category || ''}
                    onChange={e => setEditingExercise({ ...editingExercise, category: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={editingExercise.duration || ''}
                    onChange={e => setEditingExercise({ ...editingExercise, duration: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Reps"
                    value={editingExercise.reps || ''}
                    onChange={e => setEditingExercise({ ...editingExercise, reps: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                  <input
                    type="text"
                    placeholder="Sets"
                    value={editingExercise.sets || ''}
                    onChange={e => setEditingExercise({ ...editingExercise, sets: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={updateExercise}
                      className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingExercise(null)}
                      className="bg-slate-600 px-4 py-2 rounded hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <textarea
                  placeholder="Instructions"
                  value={editingExercise.instructions || ''}
                  onChange={e => setEditingExercise({ ...editingExercise, instructions: e.target.value })}
                  className="w-full mt-3 bg-slate-700 px-3 py-2 rounded text-white"
                  rows={2}
                />
              </div>
            )}

            {/* Exercises List */}
            <div className="grid gap-4">
              {exercises.map(exercise => (
                <div key={exercise.id} className="bg-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{exercise.name}</h3>
                      <span className="text-sm text-blue-400">{exercise.category}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingExercise(exercise)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteItem('exercises', exercise.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-300 mt-2">{exercise.instructions}</p>
                  <div className="flex gap-4 mt-3 text-sm text-slate-400">
                    <span>⏱ {exercise.duration}</span>
                    <span>🔄 {exercise.sets} sets</span>
                    <span>💪 {exercise.reps} reps</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-6">
            {/* Add Patient Form */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Add Patient</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={newPatient.firstName}
                  onChange={e => setNewPatient({ ...newPatient, firstName: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={newPatient.lastName}
                  onChange={e => setNewPatient({ ...newPatient, lastName: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newPatient.email}
                  onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={newPatient.phone}
                  onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="date"
                  placeholder="Date of Birth"
                  value={newPatient.dateOfBirth}
                  onChange={e => setNewPatient({ ...newPatient, dateOfBirth: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <input
                  type="text"
                  placeholder="Notes"
                  value={newPatient.notes}
                  onChange={e => setNewPatient({ ...newPatient, notes: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                />
                <button
                  onClick={addPatient}
                  className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 md:col-span-2"
                >
                  Add Patient
                </button>
              </div>
            </div>

            {/* Edit Patient Form */}
            {editingPatient && (
              <div className="bg-slate-800 p-4 rounded-xl border-2 border-blue-500">
                <h2 className="text-lg font-semibold mb-4">Edit Patient</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">First Name</span>
                    <input
                      type="text"
                      value={editingPatient.firstName || ''}
                      onChange={e => setEditingPatient({ ...editingPatient, firstName: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Last Name</span>
                    <input
                      type="text"
                      value={editingPatient.lastName || ''}
                      onChange={e => setEditingPatient({ ...editingPatient, lastName: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Email</span>
                    <input
                      type="email"
                      value={editingPatient.email || ''}
                      onChange={e => setEditingPatient({ ...editingPatient, email: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Phone</span>
                    <input
                      type="tel"
                      value={editingPatient.phone || ''}
                      onChange={e => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Date of Birth</span>
                    <input
                      type="date"
                      value={editingPatient.dateOfBirth || ''}
                      onChange={e => setEditingPatient({ ...editingPatient, dateOfBirth: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Notes</span>
                    <input
                      type="text"
                      value={editingPatient.notes || ''}
                      onChange={e => setEditingPatient({ ...editingPatient, notes: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <div className="flex gap-2 md:col-span-2">
                    <button
                      onClick={updatePatient}
                      className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingPatient(null)}
                      className="bg-slate-600 px-4 py-2 rounded hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Patients List */}
            <div className="grid gap-4">
              {patients.length === 0 ? (
                <p className="text-slate-400 text-center py-8">No patients yet. Add one above!</p>
              ) : (
                patients.map(patient => (
                  <div key={patient.id} className="bg-slate-800 p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{patient.firstName} {patient.lastName}</h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingPatient(patient)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => deleteItem('patients', patient.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-4 mt-3 text-sm text-slate-400">
                      <span>📧 {patient.email}</span>
                      <span>📞 {patient.phone}</span>
                      {patient.dateOfBirth && <span>🎂 {patient.dateOfBirth}</span>}
                    </div>
                    {patient.notes && (
                      <p className="mt-2 text-sm text-slate-300">📝 {patient.notes}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Programs Tab */}
        {activeTab === 'programs' && (
          <div className="space-y-6">
            {/* Create Program Form */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Create Exercise Program</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <select
                  value={newProgram.patientId}
                  onChange={e => setNewProgram({ ...newProgram, patientId: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
                <select
                  value={newProgram.frequency}
                  onChange={e => setNewProgram({ ...newProgram, frequency: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                >
                  <option value="daily">Daily</option>
                  <option value="2x/day">2x Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="2x/week">2x Weekly</option>
                </select>
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">Select Exercises:</p>
                <div className="flex flex-wrap gap-2">
                  {exercises.map(exercise => (
                    <button
                      key={exercise.id}
                      onClick={() => toggleExerciseInProgram(exercise.id)}
                      className={`px-3 py-1 rounded text-sm ${newProgram.exerciseIds.includes(exercise.id)
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-700 text-slate-300'
                        }`}
                    >
                      {exercise.name}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={addProgram}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Create Program
              </button>
            </div>

            {/* Programs List */}
            <div className="grid gap-4">
              {programs.map(program => (
                <div key={program.id} className="bg-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{getPatientName(program.patientId)}</h3>
                      <span className="text-sm text-blue-400">{program.frequency}</span>
                    </div>
                    <button
                      onClick={() => deleteItem('programs', program.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm text-slate-400 mb-2">Exercises:</p>
                    <div className="flex flex-wrap gap-2">
                      {program.exerciseIds.map(id => {
                        const ex = getExercise(id);
                        return ex ? (
                          <span key={id} className="bg-slate-700 px-2 py-1 rounded text-sm">
                            {ex.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500 mt-2">
                    Started: {program.startDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Therapists Tab - Admin Only */}
        {activeTab === 'therapists' && therapists.some(t => t.email === user?.email && t.permission === 'admin') && (
          <div className="space-y-6">
            {/* Add Therapist Form */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Add Therapist</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex flex-col">
                  <span className="text-sm text-slate-400 mb-1">First Name</span>
                  <input
                    type="text"
                    value={newTherapist.firstname}
                    onChange={e => setNewTherapist({ ...newTherapist, firstname: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm text-slate-400 mb-1">Last Name</span>
                  <input
                    type="text"
                    value={newTherapist.lastname}
                    onChange={e => setNewTherapist({ ...newTherapist, lastname: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm text-slate-400 mb-1">Email</span>
                  <input
                    type="email"
                    value={newTherapist.email}
                    onChange={e => setNewTherapist({ ...newTherapist, email: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                </label>
                <label className="flex flex-col">
                  <span className="text-sm text-slate-400 mb-1">Clinic</span>
                  <input
                    type="text"
                    value={newTherapist.clinic}
                    onChange={e => setNewTherapist({ ...newTherapist, clinic: e.target.value })}
                    className="bg-slate-700 px-3 py-2 rounded text-white"
                  />
                </label>
                <select
                  value={newTherapist.permission}
                  onChange={e => setNewTherapist({ ...newTherapist, permission: e.target.value })}
                  className="bg-slate-700 px-3 py-2 rounded text-white"
                >
                  <option value="therapist">Therapist</option>
                  <option value="admin">Admin</option>
                </select>
                <button
                  onClick={addTherapist}
                  className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
                >
                  Add Therapist
                </button>
              </div>
            </div>

            {/* Edit Therapist Form */}
            {editingTherapist && (
              <div className="bg-slate-800 p-4 rounded-xl border-2 border-emerald-500">
                <h2 className="text-lg font-semibold mb-4">Edit Therapist</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">First Name</span>
                    <input
                      type="text"
                      value={editingTherapist.firstname || ''}
                      onChange={e => setEditingTherapist({ ...editingTherapist, firstname: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Last Name</span>
                    <input
                      type="text"
                      value={editingTherapist.lastname || ''}
                      onChange={e => setEditingTherapist({ ...editingTherapist, lastname: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Email</span>
                    <input
                      type="email"
                      value={editingTherapist.email || ''}
                      onChange={e => setEditingTherapist({ ...editingTherapist, email: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Clinic</span>
                    <input
                      type="text"
                      value={editingTherapist.clinic || ''}
                      onChange={e => setEditingTherapist({ ...editingTherapist, clinic: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    />
                  </label>
                  <label className="flex flex-col">
                    <span className="text-sm text-slate-400 mb-1">Permission</span>
                    <select
                      value={editingTherapist.permission || 'therapist'}
                      onChange={e => setEditingTherapist({ ...editingTherapist, permission: e.target.value })}
                      className="bg-slate-700 px-3 py-2 rounded text-white"
                    >
                      <option value="therapist">Therapist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <div className="flex gap-2 items-end">
                    <button
                      onClick={updateTherapist}
                      className="bg-emerald-600 px-4 py-2 rounded hover:bg-emerald-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingTherapist(null)}
                      className="bg-slate-600 px-4 py-2 rounded hover:bg-slate-500"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Therapists List */}
            <div className="bg-slate-800 p-4 rounded-xl">
              <h2 className="text-lg font-semibold mb-4">Therapists</h2>
              <div className="space-y-3">
                {therapists.map(therapist => (
                  <div key={therapist.id} className="flex justify-between items-center bg-slate-700 p-3 rounded">
                    <div>
                      <h3 className="font-semibold">{therapist.firstname} {therapist.lastname}</h3>
                      <p className="text-sm text-slate-400">{therapist.email} • {therapist.clinic}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingTherapist(therapist)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        ✎
                      </button>
                      <button
                        onClick={() => deleteTherapist(therapist.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
                {therapists.length === 0 && <p className="text-slate-400">No therapists yet</p>}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
