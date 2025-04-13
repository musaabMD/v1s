import { db } from '@/app/src/lib/db';
import { exams } from '@/app/src/lib/schema';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const allExams = await db.select().from(exams);
    return NextResponse.json(allExams);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newExam = await db.insert(exams).values(body).returning();
    return NextResponse.json(newExam[0], { status: 201 });
  } catch (error) {
    console.error('Error creating exam:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
} 