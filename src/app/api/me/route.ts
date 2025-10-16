import {NextResponse} from "next/server";
import {InsertableUser} from "@/app/models/User";
import {neon} from "@neondatabase/serverless";
import ApiUtil from "@/app/utils/apiUtil";
import PasswordUtil from "@/app/utils/passwordUtil";
import FieldsUtil from "@/app/utils/fieldsUtil";
import SqlUtil from "@/app/utils/sqlUtil";

export async function GET() {
    const user = await ApiUtil.getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }
    return NextResponse.json((user), {status: 200});
}

/**
 * Update the connected user profile
 * @param request
 * @constructor
 */
export async function PUT(request: Request) {

    const user = await ApiUtil.getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }

    // Récupération des données dans le body
    const insertableUser: InsertableUser = await request.json();

    // Validation des données
    const validationResult = FieldsUtil.checkUser(insertableUser)
    if (!validationResult.valid) {
        return NextResponse.json({message: validationResult.errors}, {status: 400});
    }

    // Connexion à la base de données
    const sql = SqlUtil.getSql();
    const hashedPassword = PasswordUtil.hashPassword(insertableUser.password);

    const [res] = await sql`UPDATE users
              SET email      = ${insertableUser.email},
                  first_name = ${insertableUser.first_name},
                  last_name  = ${insertableUser.last_name},
                  password   = ${hashedPassword}
              WHERE id = ${user.id} RETURNING *`;

    return NextResponse.json((res), {status: 200});
}