import {NextResponse} from "next/server";
import {InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertablePage} from "@/app/models/Page";

export async function GET({ params }: { params: Promise<{ pageId: string }> }) {

    const { pageId } = await params;

    if (!pageId) {
        return NextResponse.json({message: "Page ID or domain + path is required"}, {status: 400});
    }

    const sql = SqlUtil.getSql()
    //le domaine se termine jamais par un slash, la path commence toujours par un slash
    const [res] = await sql`
        SELECT pages.* FROM pages, display_websites WHERE pages.id = ${pageId} or website_domain || path = ${pageId} LIMIT 1
    `;
    return NextResponse.json((res), {status: 200});
}

export async function DELETE({ params }: { params: Promise<{ pageId: string }> }) {

    const { pageId } = await params;

    if (!pageId) {
        return NextResponse.json({message: "PageId or domain + path is required"}, {status: 400});
    }

    // On récupère l'utilisateur connecté
    const user = await ApiUtil.getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }

    const sql = SqlUtil.getSql()

    //on récupère la page
    const [page] = await sql`
        SELECT pages.* FROM pages, display_websites WHERE (pages.id = ${pageId} or website_domain || path = ${pageId}) and owner_id = ${user.id} LIMIT 1
    `;

    if (!page) {
        return NextResponse.json({message: "Page not found"}, {status: 404});
    }

    //On supprime le site
    const [res] = await sql`
        DELETE FROM pages WHERE id = ${page.id}
    `;

    return NextResponse.json((res), {status: 200});
}

export async function PUT(request: Request, { params }: { params: Promise<{ pageId: string }> }) {

    const { pageId } = await params;

    if (!pageId) {
        return NextResponse.json({message: "PageId is required"}, {status: 400});
    }

    // On récupère l'utilisateur connecté
    const user = await ApiUtil.getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }

    // Récupération des données dans le body
    const insertablePage: InsertablePage = await request.json();

    const sql = SqlUtil.getSql()

    //on récupère le site internet
    const [website] = await sql`
        SELECT display_websites.* FROM display_websites, pages WHERE pages.id = ${pageId} and display_websites.id = pages.id LIMIT 1
    `;

    // On vérifie que le site appartient bien à l'utilisateur
    if (website.owner_id !== user.id) {
        return NextResponse.json({message: "You are not the owner of this website"}, {status: 403});
    }

    // On vérifie que le nouveau site internet appartient bien à l'utilisateur, si on veut le modifier
    if (insertablePage.website_id !== website.id) {
        const [newWebsite] = await sql`
            SELECT display_websites.* FROM display_websites WHERE display_websites.id = ${insertablePage.website_id} LIMIT 1
        `;
        if (!newWebsite || newWebsite.owner_id !== user.id) {
            return NextResponse.json({message: "You are not the owner of the new website"}, {status: 403});
        }
    }

    // Validation des données
    const validationResult = FieldsUtil.checkPage(insertablePage)
    if (!validationResult.valid) {
        return NextResponse.json({message: validationResult.errors}, {status: 400});
    }

    await sql`UPDATE pages
              SET title = ${insertablePage.title},
                    path = ${insertablePage.path},
                    website_id = ${insertablePage.website_id}
              WHERE id = ${pageId}`;

    return NextResponse.json({message: "Profile updated successfully"}, {status: 200});
}