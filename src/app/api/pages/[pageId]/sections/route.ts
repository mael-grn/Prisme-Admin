import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {Section} from "@/app/models/Section";

export async function POST(request: Request, {params}: { params: Promise<{ pageId: string }> }) {

    try {
        const {pageId} = await params;
        ApiUtil.checkParam(pageId);
        const newSection: Section = await request.json();

        const sql = SqlUtil.getSql();

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