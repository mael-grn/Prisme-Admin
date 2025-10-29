import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertableElement} from "@/app/models/Element";

export async function POST(request: Request, {params}: { params: Promise<{ sectionId: string }> }) {

    try {
        const {sectionId} = await params;
        ApiUtil.checkParam(sectionId);

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

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableElement>(FieldsUtil.checkElement, insertableElement);

        await sql`insert into elements (section_id, element_type, content, position)
                  VALUES (${insertableElement.section_id}, ${insertableElement.element_type},
                          ${insertableElement.content},
                         COALESCE((select max(position) from elements where section_id = ${sectionId}), 0) + 1)`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}

export async function GET(request: Request, {params}: { params: Promise<{ sectionId: string }> }) {
    try {
        const {sectionId} = await params;
        ApiUtil.checkParam(sectionId);
        const sql = SqlUtil.getSql()
        const res = await sql`
            SELECT *
            FROM elements
            WHERE section_id = ${sectionId}
            ORDER BY position
        `;
        return ApiUtil.getSuccessNextResponse<Element[]>(res as Element[]);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}