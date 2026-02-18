import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), '..', 'physitrack', 'data', 'data.json');

function readData() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return { exercises: [], patients: [], programs: [], compliance: [] };
  }
}

function writeData(data: any) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = readData();
  return NextResponse.json(data.patients);
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = readData();
  
  const newPatient = {
    id: Date.now().toString(36),
    ...body,
    startDate: new Date().toISOString().split('T')[0],
  };
  
  data.patients.push(newPatient);
  writeData(data);
  
  return NextResponse.json(newPatient);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const data = readData();
  
  data.patients = data.patients.filter((p: any) => p.id !== id);
  data.programs = data.programs.filter((p: any) => p.patientId !== id);
  writeData(data);
  
  return NextResponse.json({ success: true });
}
