import {neon} from "@neondatabase/serverless";
import {cookies} from "next/headers";
import {User} from "@/app/models/User";
import {getIdFromToken} from "@/app/utils/tokenUtil";

export async function isUserAdmin() : Promise<boolean> {
    'use server';
    const sql = neon(`${process.env.DATABASE_URL}`);
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    const userId = await getIdFromToken(token!.value);


    // On récupere l'utilisateur faisant la requête et on vérifie s'il est admin
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
    const currentUser : User = result[0] as User;
    return currentUser.is_admin;
}

export async function getConnectedUser() : Promise<User | null> {
    'use server';
    const sql = neon(`${process.env.DATABASE_URL}`);
    const cookieStore = await cookies();
    const token = cookieStore.get('token');
    const userId = await getIdFromToken(token!.value);


    // On récupere l'utilisateur faisant la requête et on vérifie s'il est admin
    const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (result.length === 0) {
        return null;
    }
    return result[0] as User;
}