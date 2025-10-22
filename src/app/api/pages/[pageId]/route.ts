import {NextResponse} from "next/server";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertablePage, Page} from "@/app/models/Page";

export async function GET({params}: { params: Promise<{ pageId: string }> }) {
    try {
        const {pageId} = await params;
        ApiUtil.checkParam(pageId);

        const sql = SqlUtil.getSql()
        //le domaine se termine jamais par un slash, la path commence toujours par un slash
        const [res] = await sql`
            SELECT pages.*
            FROM pages,
                 display_websites
            WHERE pages.id = ${pageId}
               or website_domain || path = ${pageId}
            LIMIT 1
        `;
        return ApiUtil.getSuccessNextResponse<Page>(res as Page);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }

}

export async function DELETE({params}: { params: Promise<{ pageId: string }> }) {

    try {
        const {pageId} = await params;
        ApiUtil.checkParam(pageId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        const sql = SqlUtil.getSql()

        //on récupère la page
        const [page] = await sql`
            SELECT pages.*
            FROM pages,
                 display_websites
            WHERE (pages.id = ${pageId} or website_domain || path = ${pageId})
              and owner_id = ${user.id}
            LIMIT 1
        `;

        if (!page) {
            return ApiUtil.getErrorNextResponse("Page not found or you are not the owner", undefined, 404);
        }

        //On supprime le site
        await sql`
            DELETE
            FROM pages
            WHERE id = ${page.id}
        `;

        return ApiUtil.getSuccessNextResponse();
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}

export async function PUT(request: Request, {params}: { params: Promise<{ pageId: string }> }) {

    try {
        const {pageId} = await params;
        ApiUtil.checkParam(pageId);

        // On récupère l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        // Récupération des données dans le body
        const insertablePage: InsertablePage = await request.json();

        const sql = SqlUtil.getSql()

        //on récupère le site internet
        const [website] = await sql`
            SELECT display_websites.*
            FROM display_websites,
                 pages
            WHERE pages.id = ${pageId}
              and display_websites.id = pages.id
            LIMIT 1
        `;

        // On vérifie que le site appartient bien à l'utilisateur
        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner", undefined, 403);
        }

        // On vérifie que le nouveau site internet appartient bien à l'utilisateur, si on veut le modifier
        if (insertablePage.website_id !== website.id) {
            const [newWebsite] = await sql`
                SELECT display_websites.*
                FROM display_websites
                WHERE display_websites.id = ${insertablePage.website_id}
                LIMIT 1
            `;
            if (!newWebsite || newWebsite.owner_id !== user.id) {
                return NextResponse.json({message: "You are not the owner of the new website"}, {status: 403});
            }
        }

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertablePage>(FieldsUtil.checkPage, insertablePage)

        await sql`UPDATE pages
                  SET title      = ${insertablePage.title},
                      path       = ${insertablePage.path},
                      website_id = ${insertablePage.website_id}
                  WHERE id = ${pageId}`;

        return ApiUtil.getSuccessNextResponse();
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error);
    }

}