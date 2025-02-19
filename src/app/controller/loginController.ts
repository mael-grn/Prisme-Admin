"use server";

import {neon} from '@neondatabase/serverless';
import {cookies} from "next/headers";

const sql = neon(`${process.env.DATABASE_URL}`);

export async function logout() {
    const requestCookies = await cookies();
    requestCookies.delete('token');
    return true;
}

export async function login(password: string | null) {
    const requestCookies = await cookies();
    if (!password) {
        const passwordCookie = requestCookies.get('token');
        if (passwordCookie === undefined) {
            requestCookies.delete('token');
            throw new Error('token not found');
        } else {
            password = passwordCookie.value;
        }
    }
    const result = await sql('SELECT * FROM password');

    if (result.length === 0) {
        throw new Error('user not found');
    }

    let userFound = false;

    for (const entry of result) {
        if (password === entry.password) {
            userFound = true;
            break;
        }
    }
    if (!userFound) {
        requestCookies.delete('token');
        throw new Error('user credentials are incorrect');
    }

    requestCookies.set('token', password);
    return true;
}

export async function addPassword(password: string) {
    return sql('INSERT INTO password VALUES (1, ($1))', [password]);
}