import {neon} from "@neondatabase/serverless";
import {NextResponse} from "next/server";
import PasswordUtil from "@/app/utils/passwordUtil";
import TokenUtil from "@/app/utils/tokenUtil";
import SqlUtil from "@/app/utils/sqlUtil";

/**
 * Création d'une session utilisateur (login)
 * @param request
 * @constructor
 */
export async function POST(request: Request) {

    const { email, password } = await request.json()
    const sql = SqlUtil.getSql();

    // Récupération de l'utilisateur
    const result = await sql`SELECT * FROM USERS WHERE email = ${email.toLowerCase()} LIMIT 1`;

    // On retourne une erreur si l'utilisateur n'existe pas
    if (result.length == 0) return NextResponse.json("Username not found", {status: 404});

    const user = result[0];

    //verification du mot de passe
    const passwordVerificationRes = await PasswordUtil.checkPassword(password, user.password);
    if (!passwordVerificationRes) return NextResponse.json("Wrong password", {status: 401});

    //création du jwt
    const jwt = await TokenUtil.createTokenFromId(user.id);

    const response = NextResponse.json(user, { status: 200 })

    // Définir un cookie sécurisé
    response.cookies.set('token', jwt, {
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
    })

    return response
}

/**
 * Suppression d'une session utilisateur (logout)
 * @constructor
 */
export async function DELETE() {
    const response = NextResponse.json("Session deleted", {status: 200})
    // Supprimer le cookie de session
    response.cookies.delete('token');
    return response;
}