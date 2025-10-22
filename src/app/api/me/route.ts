import {InsertableUser, User} from "@/app/models/User";
import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {PasswordUtil} from "@/app/utils/passwordUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";

export async function GET() {
    try {
        const user = await ApiUtil.getConnectedUser();
        return ApiUtil.getSuccessNextResponse<User>(user);
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }
}

/**
 * Update the connected user profile
 * @param request
 * @constructor
 */
export async function PUT(request: Request) {

    try {
        const user = await ApiUtil.getConnectedUser();

        // Récupération des données dans le body
        const insertableUser: InsertableUser = await request.json();

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableUser>(FieldsUtil.checkUser, insertableUser);

        // Connexion à la base de données
        const sql = SqlUtil.getSql();
        const hashedPassword = PasswordUtil.hashPassword(insertableUser.password);

        await sql`UPDATE users
              SET email      = ${insertableUser.email},
                  first_name = ${insertableUser.first_name},
                  last_name  = ${insertableUser.last_name},
                  password   = ${hashedPassword}
              WHERE id = ${user.id}`;

        return ApiUtil.getSuccessNextResponse()
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }

}