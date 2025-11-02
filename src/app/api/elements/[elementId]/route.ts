import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertableElement, Element} from "@/app/models/Element";

export async function GET(request: Request, {params}: { params: Promise<{ elementId: string }> }) {

    try {
        const {elementId} = await params;
        ApiUtil.checkParam(elementId);

        const sql = SqlUtil.getSql()

        const [element] = await sql`SELECT * FROM elements WHERE id = ${elementId} LIMIT 1`;

        if (!element) {
            return ApiUtil.getErrorNextResponse("Element not found", undefined, 404);
        }
        return ApiUtil.getSuccessNextResponse<Element>(element as Element);
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function PUT(request: Request, {params}: { params: Promise<{ elementId: string }> }) {

    try {
        const {elementId} = await params;
        ApiUtil.checkParam(elementId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        // Récupération des données dans le body
        const element: Element = await request.json();

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
        FieldsUtil.checkFieldsOrThrow<InsertableElement>(FieldsUtil.checkElement, element);

        await sql`UPDATE elements
                  SET element_type      = ${element.element_type}, content = ${element.content}
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