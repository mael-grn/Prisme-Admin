import {cookies} from "next/headers";
import {User} from "@/app/models/User";
import {TokenUtil} from "@/app/utils/tokenUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {NeonDbError} from "@neondatabase/serverless";
import {NextResponse} from "next/server";
import {UserNotFoundError} from "@/app/errors/UserNotFoundError";
import {InvalidFieldsError} from "@/app/errors/InvalidFieldsError";
import {InvalidParamsError} from "@/app/errors/InvalidParamsError";

export class ApiUtil {

    /**
     * Récupère l'utilisateur connecté à partir du token dans les cookies
     */
    static async getConnectedUser() : Promise<User> {
        'use server';
        const sql = SqlUtil.getSql();
        const cookieStore = await cookies();
        const token = cookieStore.get('token');
        const userId = await TokenUtil.getIdFromToken(token!.value);

        // Si pas de token ou token invalide
        if (!userId) {
            throw new UserNotFoundError();
        }

        // On récupere l'utilisateur faisant la requête et on vérifie s'il est admin
        const result = await sql`SELECT * FROM users WHERE id = ${userId}`;
        if (result.length === 0) {
            throw new UserNotFoundError();
        }
        return result[0] as User;
    }

    static getSuccessNextResponse<T>(data? : T, newFieldCreated = false) {
        if (data) {
            return NextResponse.json({
                success: true,
                data: data
            }, {status: newFieldCreated ? 201 : 200});
        } else {
            return NextResponse.json({
                success: true
            }, {status: newFieldCreated ? 201 : 200});
        }
    }

    static getErrorNextResponse(message?: string, error?: Error, statusCode = 500) {
        return NextResponse.json({
            success: false,
            message: message || "API error",
            error: error,
            data: null
        }, {status: statusCode});
    }

    static async getConnectedUserOrNull() : Promise<User | null> {
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

    static handleNextErrors(e: Error) {
        console.error(e);
        if (e instanceof NeonDbError) {
            return this.getErrorNextResponse("SQL error", e, SqlUtil.getHttpCodeFromSqlError(e.code));
        }else if (e instanceof UserNotFoundError) {
            return this.getErrorNextResponse("User not found", e, 404);
        }else if (e instanceof InvalidFieldsError) {
            return this.getErrorNextResponse("Object has invalid fields", e, 422);

        } else if (e instanceof InvalidParamsError) {
            return this.getErrorNextResponse("Missing or invalid query parameters", e, 400);
        } else {
            return this.getErrorNextResponse("API error", e, 500);
        }
    }

    static checkParam(param?: string) {
        if (!param) {
            throw new InvalidParamsError("Parameter is required");
        }
    }
}