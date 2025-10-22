import {InsertableUser} from "@/app/models/User";
import {PasswordUtil} from "@/app/utils/passwordUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";

export async function POST(request: Request) {

    try {
        // Récupération des données dans le body
        const insertableUser: InsertableUser = await request.json();
        FieldsUtil.checkFieldsOrThrow<InsertableUser>(FieldsUtil.checkUser, insertableUser)

        // hachage du mot de passe
        const password_hashed = await PasswordUtil.hashPassword(insertableUser.password)

        // Insertion en base de données
        const sql = SqlUtil.getSql()
        await sql`
            INSERT INTO users (email, first_name, last_name, password)
            VALUES (${insertableUser.email}, ${insertableUser.first_name}, ${insertableUser.last_name},
                    ${password_hashed})
        `;

        return ApiUtil.getSuccessNextResponse(undefined, true);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }


}