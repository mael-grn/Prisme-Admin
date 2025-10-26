import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";
import {Category, InsertableCategory, RecursiveCategory} from "@/app/models/Category";
import {Subcategory} from "@/app/models/Subcategory";

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
        const recursive = ApiUtil.isRecursiveRequest(request);

        const sql = SqlUtil.getSql();

        if (!recursive) {
            const data = await sql`
                SELECT * FROM categories
            `;
            return ApiUtil.getSuccessNextResponse<Category[]>(data as Category[]);
        }

        // Requête unique pour récupérer catégories + sous-catégories
        const rows = await sql`
            SELECT
                c.id AS category_id,
                c.name AS category_name,
                s.id AS sub_id,
                s.category_id AS sub_category_id,
                s.name AS sub_name
            FROM categories c
            LEFT JOIN subcategories s ON s.category_id = c.id
        `;

        // Agrégation en mémoire en un tableau de RecursiveCategory
        const map = new Map<number, RecursiveCategory>();
        for (const row of rows as any[]) {
            const catId: number = row.category_id;
            let entry = map.get(catId);
            if (!entry) {
                entry = { id: catId, name: row.category_name, subcategories: [] };
                map.set(catId, entry);
            }
            if (row.sub_id != null) {
                const sub: Subcategory = {
                    id: row.sub_id,
                    category_id: row.sub_category_id,
                    name: row.sub_name,
                };
                entry.subcategories.push(sub);
            }
        }

        const result = Array.from(map.values());
        return ApiUtil.getSuccessNextResponse<RecursiveCategory[]>(result);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}