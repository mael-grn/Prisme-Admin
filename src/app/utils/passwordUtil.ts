import bcrypt from 'bcryptjs';
import crypto from "crypto";

export default class PasswordUtil {

    static saltRounds = 10;

    static async hashPassword(password: string): Promise<string> {
        'use server'
        return await bcrypt.hash(password, PasswordUtil.saltRounds);
    }

    static async checkPassword(password: string, hash: string): Promise<boolean> {
        'use server'
        return await bcrypt.compare(password, hash);
    }


    static generatePassword(length = 16): string {
        if (length < 4) throw new Error("length must be >= 4");

        const lowers = "abcdefghijklmnopqrstuvwxyz";
        const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        const symbols = "!@#$%^&*()-_=+[]{};:,.<>/?";
        const all = lowers + uppers + numbers + symbols;

        // garantir au moins un de chaque catégorie
        const required = [
            lowers[crypto.randomInt(0, lowers.length)],
            uppers[crypto.randomInt(0, uppers.length)],
            numbers[crypto.randomInt(0, numbers.length)],
            symbols[crypto.randomInt(0, symbols.length)],
        ];

        const remainingLen = length - required.length;
        const chars: string[] = [...required];

        for (let i = 0; i < remainingLen; i++) {
            chars.push(all[crypto.randomInt(0, all.length)]);
        }

        // mélange sécurisé (Fisher-Yates)
        for (let i = chars.length - 1; i > 0; i--) {
            const j = crypto.randomInt(0, i + 1);
            [chars[i], chars[j]] = [chars[j], chars[i]];
        }

        return chars.join("");
    }

}