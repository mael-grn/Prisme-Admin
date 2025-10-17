import {NextResponse} from "next/server";
import {InsertableUser} from "@/app/models/User";
import {PasswordUtil} from "@/app/utils/passwordUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";

export async function POST(request: Request) {

    // Récupération des données dans le body
    const insertableUser: InsertableUser = await request.json();
    const validationResult = FieldsUtil.checkUser(insertableUser)
    if (!validationResult.valid) {
        return NextResponse.json({message: validationResult.errors}, {status: 400});
    }

    // hachage du mot de passe
    const password_hashed = await PasswordUtil.hashPassword(insertableUser.password)

    // Insertion en base de données
    const sql = SqlUtil.getSql()

    try {
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
    } catch (e) {
        if (e instanceof Error && e.message.includes("duplicate key value")) {
            return NextResponse.json({message: "Email already in use"}, {status: 409});
        }
    }
}