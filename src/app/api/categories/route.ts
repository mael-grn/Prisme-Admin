import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";
import {Category, InsertableCategory} from "@/app/models/Category";

export async function POST(request: Request) {
    try {
        // Récupération des données dans le body
        const insertableCategory: InsertableCategory = await request.json();
        FieldsUtil.checkFieldsOrThrow<InsertableCategory>(FieldsUtil.checkCategory, insertableCategory)

        // Insertion en base de données
        const sql = SqlUtil.getSql()
        await sql`
            INSERT INTO categories (name) values ${insertableCategory.name}
        `;

        return ApiUtil.getSuccessNextResponse(undefined, true);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}

export async function GET(request: Request) {
    try {
        // Insertion en base de données
        const sql = SqlUtil.getSql()
        const data = await sql`
            SELECT * FROM categories
        `;

        return ApiUtil.getSuccessNextResponse<Category[]>(data as Category[]);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}