import jwt from 'jsonwebtoken';

export async function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
  } catch (error) {
    throw new Error('Invalid token');
  }
} 