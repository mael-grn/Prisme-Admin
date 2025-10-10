import bcrypt from 'bcryptjs';

const saltRounds = 10;

export async function hashPassword(password: string): Promise<string> {
    'use server'
    return await bcrypt.hash(password, saltRounds);
}

export async function checkPassword(password: string, hash: string): Promise<boolean> {
    'use server'
    return await bcrypt.compare(password, hash);
}