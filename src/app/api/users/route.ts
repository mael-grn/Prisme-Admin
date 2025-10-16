import ApiUtil from "@/app/utils/apiUtil";
import {NextResponse} from "next/server";
import {DisplayWebsite, InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import FieldsUtil from "@/app/utils/fieldsUtil";
import PasswordUtil from "@/app/utils/passwordUtil";
import SqlUtil from "@/app/utils/sqlUtil";
import {InsertableUser} from "@/app/models/User";

export async function POST(request: Request) {

    // Récupération des données dans le body
    const insertableUser: InsertableUser = await request.json();
    const validationResult = FieldsUtil.checkUser(insertableUser)
    if (!validationResult.valid) {
        return NextResponse.json({message: validationResult.errors}, {status: 400});
    }

    // hashage du mot de passe
    const password_hashed = await PasswordUtil.hashPassword(insertableUser.password)

    // Insertion en base de données
    const sql = SqlUtil.getSql()

    const [inserted] = await sql`
        INSERT INTO users (email, first_name, last_name, password)
        VALUES (${insertableUser.email}, ${insertableUser.first_name}, ${insertableUser.last_name}, ${password_hashed})
        RETURNING *
    `;

    // Vérification de l'insertion
    if (!inserted) {
        return NextResponse.json({message: "Error inserting website"}, {status: 500});
    }

    return NextResponse.json(inserted, {status: 201});
}