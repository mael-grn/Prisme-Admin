import {neon} from "@neondatabase/serverless";
import {NextResponse} from "next/server";
import {checkPassword} from "@/app/utils/passwordUtil";
import {createTokenFromId} from "@/app/utils/tokenUtil";

export async function POST(request: Request) {
    const { username, password } = await request.json()
    const sql = neon(`${process.env.DATABASE_URL}`);
    const result = await sql`SELECT * FROM USERS WHERE username = ${username.toLowerCase()} LIMIT 1`;

    if (result.length == 0) return NextResponse.json("Username not found", {status: 404});

    //verification du mot de passe
    const passwordVerificationRes = await checkPassword(password, result[0].password);
    if (!passwordVerificationRes) return NextResponse.json("Wrong password", {status: 401});

    console.log(result[0].is_approved);
    if (!result[0].is_approved) return NextResponse.json("Account not approved yet", {status: 403});
    //création du jwt
    const jwt = await createTokenFromId(result[0].id);

    const response = NextResponse.json(result[0], { status: 200 })

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

export async function DELETE() {
    const response = NextResponse.json("Session deleted", {status: 200})
    // Supprimer le cookie de session
    response.cookies.delete('token');
    return response;
}