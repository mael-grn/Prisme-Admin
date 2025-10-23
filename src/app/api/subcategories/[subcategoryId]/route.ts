import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {InsertableSubcategory} from "@/app/models/Subcategory";

export async function PUT(request: Request, {params}: { params: Promise<{ subcategoryId: string }> }) {

    try {
        const {subcategoryId} = await params;
        ApiUtil.checkParam(subcategoryId);
        const insertableSubCategory: InsertableSubcategory = await request.json();
        FieldsUtil.checkFieldsOrThrow<InsertableSubcategory>(FieldsUtil.checkSubCategory, insertableSubCategory)

        const sql = SqlUtil.getSql()

        await sql`
            update subcategories set name = ${insertableSubCategory.name} where id = ${subcategoryId}
        `;
        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function DELETE(request: Request, {params}: { params: Promise<{ subcategoryId: string }> }) {

    try {
        const {subcategoryId} = await params;
        ApiUtil.checkParam(subcategoryId);

        const sql = SqlUtil.getSql()

        const sectionsWithSubCategory = await sql`
            select 1 from sections_subcategories where sections_subcategories.subcategory_id = ${subcategoryId} limit 1
        `;

        if (sectionsWithSubCategory.length > 0) {
            return ApiUtil.getErrorNextResponse("La sous-catégorie ne peut pas être supprimée car elle est utilisée par des sections.", undefined, 400);
        }

        await sql`
            delete from subcategories where id = ${subcategoryId}
        `;
        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}