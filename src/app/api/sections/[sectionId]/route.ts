import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertableSection, RecursiveSection, Section} from "@/app/models/Section";
import {Element} from "@/app/models/Element";
import CategoryService from "@/app/service/categoryService";

export async function GET(request: Request, {params}: { params: Promise<{ sectionId: string }> }) {

    try {
        const {sectionId} = await params;
        ApiUtil.checkParam(sectionId);

        const sql = SqlUtil.getSql();

        const [res] = await sql`SELECT * from sections where id = ${sectionId}`;

        if (!res) {
            return ApiUtil.getErrorNextResponse("Section was not found.");
        }

        const recursive = ApiUtil.isRecursiveRequest(request);
        if (!recursive) {
            return ApiUtil.getSuccessNextResponse<Section>(res as Section);
        }

        const elements = await sql`SELECT * from elements where section_id = ${sectionId}`;

        const categories = await CategoryService.getAllRecursiveCategories()

        const validSubCategoriesIdsForSection = await sql`SELECT subcategory_id from sections_subcategories where section_id = ${sectionId}`;

        const validCategories = categories.filter(category => {
            return validSubCategoriesIdsForSection.some((validSubCategoryIdObj) => validSubCategoryIdObj.subcategory_id === category.id);
        });

        const recursiveSection: RecursiveSection = {
            ...(res as Section),
            elements: elements as Element[],
            categories: validCategories
        }

        return ApiUtil.getSuccessNextResponse<RecursiveSection>(recursiveSection);
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function DELETE(request: Request, {params}: { params: Promise<{ sectionId: string }> }) {

    try {
        const {sectionId} = await params;
        ApiUtil.checkParam(sectionId);

        const sql = SqlUtil.getSql();

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        //on récupère le site internet
        const [website] = await sql`
            SELECT display_websites.*
            FROM display_websites,
                 pages,
                 sections
            WHERE 
            sections.id = ${sectionId}
            and pages.id = sections.page_id
              and display_websites.id = pages.website_id
            LIMIT 1
        `;

        // On vérifie que le site appartient bien à l'utilisateur
        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner", undefined, 403);
        }

        await sql`delete from sections where id = ${sectionId}`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function PUT(request: Request, {params}: { params: Promise<{ sectionId: string }> }) {

    try {
        const {sectionId} = await params;
        ApiUtil.checkParam(sectionId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        // Récupération des données dans le body
        const insertableSection: InsertableSection = await request.json();

        const sql = SqlUtil.getSql()

        //on récupère le site internet
        const [website] = await sql`
            SELECT display_websites.*
            FROM display_websites,
                 pages,
                 sections
            WHERE sections.id = ${sectionId}
              and pages.id = sections.page_id
              and display_websites.id = pages.website_id
            LIMIT 1
        `;

        // On vérifie que le site appartient bien à l'utilisateur
        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner", undefined, 403);
        }

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableSection>(FieldsUtil.checkSection, insertableSection);

        await sql`UPDATE sections
                  SET title        = ${insertableSection.title},
                      section_type = ${insertableSection.section_type}
                  WHERE id = ${sectionId}`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}