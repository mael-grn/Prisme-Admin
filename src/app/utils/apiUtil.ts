import {neon} from "@neondatabase/serverless";
import {cookies} from "next/headers";
import {User} from "@/app/models/User";
import TokenUtil from "@/app/utils/tokenUtil";
import SqlUtil from "@/app/utils/sqlUtil";

export default class ApiUtil {

    /**
     * Récupère l'utilisateur connecté à partir du token dans les cookies
     */
    static async getConnectedUser() : Promise<User | null> {
        'use server';
        const sql = SqlUtil.getSql();
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        const userId = await TokenUtil.getIdFromToken(token!.value);

        // Si pas de token ou token invalide
        if (!userId) {
            return null;
        }

        // On récupere l'utilisateur faisant la requête et on vérifie s'il est admin
        const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
        if (result.length === 0) {
            return null;
        }
        return result[0] as User;
    }


}