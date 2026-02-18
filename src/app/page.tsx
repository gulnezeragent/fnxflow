'use client';

import { useState, useEffect } from 'react';

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
  name: string;
  email: string;
  phone: string;
  condition: string;
  startDate: string;
}

interface Program {
  id: string;
  patientId: string;
  exerciseIds: string[];
  frequency: string;
  startDate: string;
}

type Tab = 'exercises' | 'patients' | 'programs';

export default function PhysitrackApp() {
  const [activeTab, setActiveTab] = useState<Tab>('exercises');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newExercise, setNewExercise] = useState({ name: '', category: '', instructions: '', reps: '', sets: '', duration: '' });
  const [newPatient, setNewPatient] = useState({ name: '', email: '', phone: '', condition: '' });
  const [newProgram, setNewProgram] = useState({ patientId: '', exerciseIds: [] as string[], frequency: 'daily' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [exercisesRes, patientsRes, programsRes] = await Promise.all([
        fetch('/api/exercises'),
        fetch('/api/patients'),
        fetch('/api/programs'),
      ]);
      setExercises(await exercisesRes.json());
      setPatients(await patientsRes.json());
      setPrograms(await programsRes.json());
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

  const addPatient = async () => {
    if (!newPatient.name) return;
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPatient),
    });
    setNewPatient({ name: '', email: '', phone: '', condition: '' });
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

  const getPatientName = (id: string) => patients.find(p => p.id === id)?.name || 'Unknown';
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
      <header className="bg-blue-600 p-4">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          🏥 PhysioFlow
        </h1>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-slate-700">
        {(['exercises', 'patients', 'programs'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-medium capitalize ${
              activeTab === tab 
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

            {/* Exercises List */}
            <div className="grid gap-4">
              {exercises.map(exercise => (
                <div key={exercise.id} className="bg-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{exercise.name}</h3>
                      <span className="text-sm text-blue-400">{exercise.category}</span>
                    </div>
                    <button
                      onClick={() => deleteItem('exercises', exercise.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
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
                  placeholder="Patient name"
                  value={newPatient.name}
                  onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
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
                  type="text"
                  placeholder="Condition"
                  value={newPatient.condition}
                  onChange={e => setNewPatient({ ...newPatient, condition: e.target.value })}
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

            {/* Patients List */}
            <div className="grid gap-4">
              {patients.map(patient => (
                <div key={patient.id} className="bg-slate-800 p-4 rounded-xl">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{patient.name}</h3>
                      <span className="text-sm text-blue-400">{patient.condition}</span>
                    </div>
                    <button
                      onClick={() => deleteItem('patients', patient.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ✕
                    </button>
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-slate-400">
                    <span>📧 {patient.email}</span>
                    <span>📞 {patient.phone}</span>
                    <span>📅 Since {patient.startDate}</span>
                  </div>
                </div>
              ))}
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
                    <option key={p.id} value={p.id}>{p.name}</option>
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
                      className={`px-3 py-1 rounded text-sm ${
                        newProgram.exerciseIds.includes(exercise.id)
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
      </main>
    </div>
  );
}
