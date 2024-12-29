import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function GET(request) {
  const password = 'admin123'; // Your desired password
  const hashedPassword = await bcrypt.hash(password, 10);
  return NextResponse.json({ hashedPassword });
}