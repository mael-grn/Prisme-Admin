import {ApiUtil} from "@/app/utils/apiUtil";
import {Element} from "@/app/models/Element";
import {SqlUtil} from "@/app/utils/sqlUtil";

export async function POST(request: Request, {params}: { params: Promise<{ elementId: string }> }) {
    try {
        const {elementId} = await params;
        ApiUtil.checkParam(elementId);

        const user = await ApiUtil.getConnectedUser();
        const elementWithNewPos: Element = await request.json();

        const sql = SqlUtil.getSql();

        // Récupère l'élément et la page/website pour vérifier l'appartenance
        const [elementWithUser] = await sql`
            SELECT elements.*, sections.page_id, pages.website_id
            FROM elements
                     JOIN sections ON sections.id = elements.section_id
                     JOIN pages ON pages.id = sections.page_id
                     JOIN display_websites ON pages.website_id = display_websites.id
            WHERE elements.id = ${Number(elementId)}::int
              AND display_websites.owner_id = ${user.id}::int
        `;

        if (!elementWithUser) {
            return ApiUtil.getErrorNextResponse("No element found that belong to user", undefined, 404);
        }

        const oldPos = Number(elementWithUser.position);
        const newPos = Number(elementWithNewPos.position);

        if (!Number.isInteger(newPos) || newPos < 1) {
            return ApiUtil.getErrorNextResponse("Invalid new position", undefined, 400);
        }

        if (newPos === oldPos) {
            return ApiUtil.getSuccessNextResponse();
        }

        // Mise à jour atomique des positions pour la même section (scope = section_id)
        await sql`
            UPDATE elements
            SET position = CASE
                               WHEN id = ${Number(elementId)}::int THEN ${newPos}::int
                               WHEN ${newPos}::int < ${oldPos}::int AND position >= ${newPos}::int AND
                                    position < ${oldPos}::int
                                   THEN position + 1
                               WHEN ${newPos}::int > ${oldPos}::int AND position > ${oldPos}::int AND
                                    position <= ${newPos}::int
                                   THEN position - 1
                               ELSE position
                END
            WHERE section_id = ${Number(elementWithUser.section_id)}::int
              AND (id = ${Number(elementId)}::int OR
                   position BETWEEN LEAST(${newPos}::int, ${oldPos}::int) AND GREATEST(${newPos}::int, ${oldPos}::int))
        `;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }
}