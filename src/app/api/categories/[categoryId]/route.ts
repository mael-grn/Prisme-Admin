import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertableCategory} from "@/app/models/Category";

export async function PUT(request: Request, {params}: { params: Promise<{ categoryId: string }> }) {

    try {
        const {categoryId} = await params;
        ApiUtil.checkParam(categoryId);
        const insertableCategory: InsertableCategory = await request.json();
        FieldsUtil.checkFieldsOrThrow<InsertableCategory>(FieldsUtil.checkCategory, insertableCategory)

        const sql = SqlUtil.getSql()

        //on récupère le site internet
        await sql`
            update categories set name = ${insertableCategory.name} where id = ${categoryId}
        `;
        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function DELETE(request: Request, {params}: { params: Promise<{ categoryId: string }> }) {

    try {
        const {categoryId} = await params;
        ApiUtil.checkParam(categoryId);

        const sql = SqlUtil.getSql()

        const sectionsWithCategory = await sql`
            select 1 from sections_subcategories, subcategories where sections_subcategories.subcategory_id = subcategories.id and subcategories.category_id = ${categoryId} limit 1
        `;

        if (sectionsWithCategory.length > 0) {
            return ApiUtil.getErrorNextResponse("La catégorie ne peut pas être supprimée car elle est utilisée par des sections.", undefined, 400);
        }

        //on récupère le site internet
        await sql`
            delete from categories where id = ${categoryId}
        `;
        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}