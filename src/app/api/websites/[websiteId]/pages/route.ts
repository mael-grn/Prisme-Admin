import {NextResponse} from "next/server";
import {InsertablePage} from "@/app/models/Page";
import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";

export async function POST(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

    const { websiteId } = await params;

    if (!websiteId) {
        return NextResponse.json({message: "Website ID or domain is required"}, {status: 400});
    }

    // On récupère l'utilisateur connecté
    const user = await ApiUtil.getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }

    const sql = SqlUtil.getSql()

    //on récupère le site internet
    const [website] = await sql`
        SELECT * FROM display_websites WHERE id = ${websiteId} or website_domain = ${websiteId} LIMIT 1
    `;

    // On vérifie que le site appartient bien à l'utilisateur
    if (website.owner_id !== user.id) {
        return NextResponse.json({message: "You are not the owner of this website"}, {status: 403});
    }

    // Récupération des données dans le body
    const insertablePage: InsertablePage = await request.json();

    // Validation des données
    const validationResult = FieldsUtil.checkPage(insertablePage)
    if (!validationResult.valid) {
        return NextResponse.json({message: validationResult.errors}, {status: 400});
    }

    const [maxPositionReq] = await sql`SELECT MAX(position) as max_position FROM pages WHERE website_id = ${website.id}`;
    const maxPosition = maxPositionReq?.max_position || 0;
    const pagePosition = maxPosition + 1;
    const [inserted] = await sql`INSERT INTO pages (path, website_id, icon_svg, title, description, position)
              VALUES (${insertablePage.path}, ${website.id}, ${insertablePage.icon_svg}, ${insertablePage.title}, ${insertablePage.description}, ${pagePosition})
              RETURNING *`;

    return NextResponse.json((inserted), {status: 200});
}

export async function GET(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

    const { websiteId } = await params;

    if (!websiteId) {
        return NextResponse.json({message: "Website ID or domain is required"}, {status: 400});
    }

    const sql = SqlUtil.getSql()
    const res = await sql`
        SELECT pages.* FROM display_websites, pages WHERE (display_websites.id = ${websiteId} or website_domain = ${websiteId}) and pages.website_id = display_websites.id ORDER BY pages.position
    `;
    return NextResponse.json((res), {status: 200});
}