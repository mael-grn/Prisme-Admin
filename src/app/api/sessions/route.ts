import {NextResponse} from "next/server";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {PasswordUtil} from "@/app/utils/passwordUtil";
import {TokenUtil} from "@/app/utils/tokenUtil";
import {ApiUtil} from "@/app/utils/apiUtil";


/**
 * Création d'une session utilisateur (login)
 * @param request
 * @constructor
 */
export async function POST(request: Request) {

    try {
        const { email, password } = await request.json()
        const sql = SqlUtil.getSql();

        // Récupération de l'utilisateur
        const result = await sql`SELECT * FROM USERS WHERE email = ${email.toLowerCase()} LIMIT 1`;

        // On retourne une erreur si l'utilisateur n'existe pas
        if (result.length == 0) return ApiUtil.getErrorNextResponse("User not found", undefined, 404);

        const user = result[0];

        //verification du mot de passe
        const passwordVerificationRes = await PasswordUtil.checkPassword(password, user.password);
        if (!passwordVerificationRes) return ApiUtil.getErrorNextResponse("Invalid Password", undefined, 401);

        //création du jwt
        const jwt = await TokenUtil.createTokenFromId(user.id);

        const response = ApiUtil.getSuccessNextResponse()

        // Définir un cookie sécurisé
        response.cookies.set('token', jwt, {
            httpOnly: true,
            secure: true,
            path: '/',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 365,
        })

        return response
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}

/**
 * Suppression d'une session utilisateur (logout)
 * @constructor
 */
export async function DELETE() {
    try {
        const response = NextResponse.json("Session deleted", {status: 200})
        // Supprimer le cookie de session
        response.cookies.delete('token');
        return response;
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}