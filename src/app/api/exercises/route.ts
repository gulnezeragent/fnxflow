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
  return NextResponse.json(data.exercises);
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = readData();
  
  const newExercise = {
    id: Date.now().toString(36),
    ...body,
  };
  
  data.exercises.push(newExercise);
  writeData(data);
  
  return NextResponse.json(newExercise);
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const data = readData();
  
  data.exercises = data.exercises.filter((e: any) => e.id !== id);
  writeData(data);
  
  return NextResponse.json({ success: true });
}
