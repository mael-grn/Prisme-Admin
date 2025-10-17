import {NextResponse} from "next/server";
import {InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";

export async function GET({ params }: { params: Promise<{ websiteId: string }> }) {

    const { websiteId } = await params;

    if (!websiteId) {
        return NextResponse.json({message: "Website ID or domain is required"}, {status: 400});
    }

    const sql = SqlUtil.getSql()
    const [res] = await sql`
        SELECT * FROM display_websites WHERE id = ${websiteId} or website_domain = ${websiteId} LIMIT 1
    `;
    return NextResponse.json((res), {status: 200});
}

export async function DELETE({ params }: { params: Promise<{ websiteId: string }> }) {

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

    //On supprime le site
    const [res] = await sql`
        DELETE FROM display_websites WHERE id = ${website.id}
    `;

    return NextResponse.json((res), {status: 200});
}

export async function PUT(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

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
    const insertableWebsite: InsertableDisplayWebsite = await request.json();

    // Validation des données
    const validationResult = FieldsUtil.checkDisplayWebsite(insertableWebsite)
    if (!validationResult.valid) {
        return NextResponse.json({message: validationResult.errors}, {status: 400});
    }

    await sql`UPDATE display_websites
              SET website_domain = ${website.domain},
                    hero_image_url = ${insertableWebsite.hero_image_url},
                    hero_title = ${insertableWebsite.hero_title}
              WHERE id = ${website.id}`;

    return NextResponse.json({message: "Profile updated successfully"}, {status: 200});
}