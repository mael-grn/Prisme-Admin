import {NextResponse} from "next/server";
import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {Page} from "@/app/models/Page";

export async function POST(request: Request, {params}: { params: Promise<{ pageId: string }> }) {

    try {
        const {pageId} = await params;
        ApiUtil.checkParam(pageId)
        const user = await ApiUtil.getConnectedUser();
        const pageWithNewPos: Page = await request.json();

        const sql = SqlUtil.getSql();

        const [pageWithUser] = await sql`
            select pages.*
            from pages
                     join display_websites on pages.website_id = display_websites.id
            where display_websites.owner_id = ${user.id}
              and pages.id = ${pageId}
        `;
        if (!pageWithUser) {
            return ApiUtil.getErrorNextResponse("No page found that belong to user", undefined, 404)
        }

        const oldPos = Number(pageWithUser.position);
        const newPos = Number(pageWithNewPos.position);

        if (!Number.isInteger(newPos) || newPos < 1) {
            return ApiUtil.getErrorNextResponse("Invalid new position", undefined, 400)
        }

        if (newPos === oldPos) {
            return ApiUtil.getSuccessNextResponse()
        }

        // Mise à jour atomique : on ajuste toutes les positions affectées en une seule requête.
        await sql`
            UPDATE pages
            SET position = CASE
                               WHEN id = ${pageId}::int THEN ${newPos}::int
                               WHEN ${newPos}::int < ${oldPos}::int AND position >= ${newPos}::int AND
                                    position < ${oldPos}::int
                                   THEN position + 1
                               WHEN ${newPos}::int > ${oldPos}::int AND position > ${oldPos}::int AND
                                    position <= ${newPos}::int
                                   THEN position - 1
                               ELSE position
                END
            WHERE website_id = ${pageWithUser.website_id}::int
              AND (id = ${pageId}::int OR
                   position BETWEEN LEAST(${newPos}::int, ${oldPos}::int) AND GREATEST(${newPos}::int, ${oldPos}::int))
        `;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error)
    }

}