import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {Subcategory} from "@/app/models/Subcategory";

export async function POST(request: Request, {params}: { params: Promise<{ sectionId: string }> }) {

    try {
        const {sectionId} = await params;
        ApiUtil.checkParam(sectionId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        // Récupération des données dans le body
        const subcategory: Subcategory = await request.json();

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

        await sql`insert into sections_subcategories (section_id, subcategory_id)
                  VALUES (${sectionId}, ${subcategory.id})`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}