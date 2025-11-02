import bcrypt from 'bcryptjs';

export class PasswordUtil {

    static saltRounds = 10;

    static async hashPassword(password: string): Promise<string> {
        'use server'
        return await bcrypt.hash(password, PasswordUtil.saltRounds);
    }

    static async checkPassword(password: string, hash: string): Promise<boolean> {
        'use server'
        return await bcrypt.compare(password, hash);
    }

}