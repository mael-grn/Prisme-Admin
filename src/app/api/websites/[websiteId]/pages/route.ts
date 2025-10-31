import {InsertablePage, Page, RecursivePage} from "@/app/models/Page";
import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import PageService from "@/app/service/pageService";

export async function POST(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

    try {
        const { websiteId } = await params;

        ApiUtil.checkParam(websiteId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();


        const sql = SqlUtil.getSql()

        //on récupère le site internet
        const [website] = await sql`
        SELECT * FROM display_websites WHERE id = ${websiteId} or website_domain = ${websiteId} LIMIT 1
    `;

        // On vérifie que le site appartient bien à l'utilisateur
        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner of this website", undefined, 403);
        }

        // Récupération des données dans le body
        const insertablePage: InsertablePage = await request.json();

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertablePage>(FieldsUtil.checkPage, insertablePage)

        const [maxPositionReq] = await sql`SELECT MAX(position) as max_position FROM pages WHERE website_id = ${website.id}`;
        const maxPosition = maxPositionReq?.max_position || 0;
        const pagePosition = maxPosition + 1;
        await sql`INSERT INTO pages (path, website_id, icon_svg, title, description, position)
              VALUES (${insertablePage.path}, ${website.id}, ${insertablePage.icon_svg}, ${insertablePage.title}, ${insertablePage.description}, ${pagePosition})
              `;

        return ApiUtil.getSuccessNextResponse(undefined, true);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error)
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

    try {
        const { websiteId } = await params;

        ApiUtil.checkParam(websiteId);

        const sql = SqlUtil.getSql()
        const res = await sql`
        SELECT pages.* FROM display_websites, pages WHERE (display_websites.id = ${websiteId} or website_domain = ${websiteId}) and pages.website_id = display_websites.id ORDER BY pages.position
    `;
        if (!ApiUtil.isRecursiveRequest(request)) {
            return ApiUtil.getSuccessNextResponse<Page[]>(res as Page[]);
        }

        const recursivePages: RecursivePage[] = [];

        for (const page of res as Page[]) {
            recursivePages.push(await PageService.getRecursivePageById(page.id));
        }

        return ApiUtil.getSuccessNextResponse<RecursivePage[]>(recursivePages);
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error)
    }

}