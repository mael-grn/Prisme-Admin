// typescript
import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {Section} from "@/app/models/Section";

export async function POST(request: Request, {params}: { params: Promise<{ sectionId: string }> }) {
    try {
        const {sectionId} = await params;
        ApiUtil.checkParam(sectionId);

        const user = await ApiUtil.getConnectedUser();
        const sectionWithNewPos: Section = await request.json();

        const sql = SqlUtil.getSql();

        // Récupère la section et la page/website pour vérifier l'appartenance
        const [sectionWithUser] = await sql`
            SELECT sections.*, pages.website_id
            FROM sections
                     JOIN pages ON pages.id = sections.page_id
                     JOIN display_websites ON pages.website_id = display_websites.id
            WHERE sections.id = ${Number(sectionId)}
              AND display_websites.owner_id = ${user.id}
        `;

        if (!sectionWithUser) {
            return ApiUtil.getErrorNextResponse("No section found that belong to user", undefined, 404);
        }

        const oldPos = Number(sectionWithUser.position);
        const newPos = Number(sectionWithNewPos.position);

        if (!Number.isInteger(newPos) || newPos < 1) {
            return ApiUtil.getErrorNextResponse("Invalid new position", undefined, 400);
        }

        if (newPos === oldPos) {
            return ApiUtil.getSuccessNextResponse();
        }

        // Mise à jour atomique des positions pour la même page (scope = page_id)
        await sql`
            UPDATE sections
            SET position = CASE
                               WHEN id = ${Number(sectionId)} THEN ${newPos}::int
                               WHEN ${newPos}::int < ${oldPos}::int AND position >= ${newPos}::int AND
                                    position < ${oldPos}::int THEN position + 1
                               WHEN ${newPos}::int > ${oldPos}::int AND position > ${oldPos}::int AND
                                    position <= ${newPos}::int THEN position - 1
                               ELSE position
                END
            WHERE page_id = ${Number(sectionWithUser.page_id)}::int
              AND (id = ${Number(sectionId)} OR
                   position BETWEEN LEAST(${newPos}::int, ${oldPos}::int) AND GREATEST(${newPos}::int, ${oldPos}::int))
        `;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }
}