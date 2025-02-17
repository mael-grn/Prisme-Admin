import { NextResponse } from 'next/server';
import {login} from "@/app/controller/loginController";

export async function middleware(req : Request) {
    try {
        // Attendre la validation du login avec un token
        await login(null);
        // Si la connexion réussit, laisser passer la requête
        return NextResponse.next();
    } catch (e) {
        console.log(e);
        // Redirection si le token est invalide ou absent
        return NextResponse.redirect(new URL('/', req.url));
    }
}

/**
 * Pages protégées par le middleware
 * @type {{matcher: string[]}}
 */
export const config = {
    matcher: ['/secure/:path*']
};