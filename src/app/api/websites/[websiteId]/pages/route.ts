import {NextResponse} from "next/server";
import ApiUtil from "@/app/utils/apiUtil";
import SqlUtil from "@/app/utils/sqlUtil";
import {InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import FieldsUtil from "@/app/utils/fieldsUtil";
import {InsertablePage} from "@/app/models/Page";

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

    const [inserted] = await sql`INSERT INTO pages (path, website_id, icon_svg, title, description, position)
              VALUES (${insertablePage.path}, ${website.id}, ${insertablePage.icon_svg}, ${insertablePage.title}, ${insertablePage.description}, ${insertablePage.position})
              RETURNING *`;

    return NextResponse.json((inserted), {status: 200});
}