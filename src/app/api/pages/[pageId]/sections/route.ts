import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {Section} from "@/app/models/Section";

export async function POST(request: Request, {params}: { params: Promise<{ pageId: string }> }) {

    try {
        const {pageId} = await params;
        ApiUtil.checkParam(pageId);
        const newSection: Section = await request.json();

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
            pages.id = ${pageId}
              and display_websites.id = pages.website_id
            LIMIT 1
        `;

        // On vérifie que le site appartient bien à l'utilisateur
        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner", undefined, 403);
        }

        await sql`
            insert into sections (page_id, section_type, position)
            values (${pageId}, ${newSection.section_type},
                    COALESCE((select max(position) from sections where page_id = ${pageId}), 0) + 1)
        `;
        return ApiUtil.getSuccessNextResponse(null, true);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}

export async function GET(request: Request, {params}: { params: Promise<{ pageId: string }> }) {
    try {
        const {pageId} = await params;
        ApiUtil.checkParam(pageId);
        const sql = SqlUtil.getSql()
        const res = await sql`
            SELECT *
            FROM sections
            WHERE page_id = ${pageId}
            ORDER BY position
        `;
        return ApiUtil.getSuccessNextResponse<Section[]>(res as Section[]);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}