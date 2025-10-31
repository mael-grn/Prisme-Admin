import {ApiUtil} from "@/app/utils/apiUtil";
import {InsertableSection} from "@/app/models/Section";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertableElement} from "@/app/models/Element";

export async function PUT(request: Request, {params}: { params: Promise<{ elementId: string }> }) {

    try {
        const {elementId} = await params;
        ApiUtil.checkParam(elementId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        // Récupération des données dans le body
        const insertableElement: InsertableElement = await request.json();

        const sql = SqlUtil.getSql()

        //on récupère le site internet
        const [website] = await sql`
            SELECT display_websites.*
            FROM display_websites,
                 pages,
                 sections,
                 elements
            WHERE 
                elements.id = ${elementId}
             and elements.section_id = sections.id
            and pages.id = sections.page_id
              and display_websites.id = pages.website_id
            LIMIT 1
        `;

        // On vérifie que le site appartient bien à l'utilisateur
        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner", undefined, 403);
        }

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableElement>(FieldsUtil.checkElement, insertableElement);

        await sql`UPDATE elements
                  SET element_type      = ${insertableElement.element_type}, content = ${insertableElement.content}
                  WHERE id = ${elementId}`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function DELETE(request: Request, {params}: { params: Promise<{ elementId: string }> }) {

    try {
        const {elementId} = await params;
        ApiUtil.checkParam(elementId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        const sql = SqlUtil.getSql()

        //on récupère le site internet
        const [website] = await sql`
            SELECT display_websites.*
            FROM display_websites,
                 pages,
                 sections,
                 elements
            WHERE 
                elements.id = ${elementId}
             and elements.section_id = sections.id
            and pages.id = sections.page_id
              and display_websites.id = pages.website_id
            LIMIT 1
        `;

        // On vérifie que le site appartient bien à l'utilisateur
        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner", undefined, 403);
        }

        await sql`DELETE FROM elements where elements.id = ${elementId}`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}