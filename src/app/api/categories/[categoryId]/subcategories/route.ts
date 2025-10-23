import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {InsertableSubcategory, Subcategory} from "@/app/models/Subcategory";

export async function POST(request: Request, {params}: { params: Promise<{ categoryId: string }> }) {

    try {
        const {categoryId} = await params;
        ApiUtil.checkParam(categoryId);
        const insertableSubcategory: InsertableSubcategory = await request.json();
        FieldsUtil.checkFieldsOrThrow<InsertableSubcategory>(FieldsUtil.checkSubCategory, insertableSubcategory)

        const sql = SqlUtil.getSql()

        await sql`
            insert into subcategories (category_id, name) VALUES (${categoryId}, ${insertableSubcategory.name})
        `;
        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function GET(request: Request, {params}: { params: Promise<{ categoryId: string }> }) {

    try {
        const {categoryId} = await params;
        ApiUtil.checkParam(categoryId);

        const sql = SqlUtil.getSql()

        const data = await sql`
            select * from subcategories where category_id = ${categoryId}
        `;
        return ApiUtil.getSuccessNextResponse<Subcategory[]>(data as Subcategory[]);
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}