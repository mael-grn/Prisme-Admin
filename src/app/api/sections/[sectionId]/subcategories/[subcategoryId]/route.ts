import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";

export async function DELETE(request: Request, {params}: { params: Promise<{ sectionId: string, subcategoryId: string }> }) {

    try {
        const {sectionId, subcategoryId} = await params;
        ApiUtil.checkParam(sectionId);
        ApiUtil.checkParam(subcategoryId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

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

        await sql`delete from sections_subcategories where subcategory_id = ${subcategoryId} and section_id = ${sectionId}`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}