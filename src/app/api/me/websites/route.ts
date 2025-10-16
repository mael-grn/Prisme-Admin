import ApiUtil from "@/app/utils/apiUtil";
import {NextResponse} from "next/server";
import FieldsUtil from "@/app/utils/fieldsUtil";
import {DisplayWebsite, InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import SqlUtil from "@/app/utils/sqlUtil";
import PasswordUtil from "@/app/utils/passwordUtil";

export async function POST(request: Request) {
    const user = await ApiUtil.getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }

    // Récupération des données dans le body
    const insertableWebsite: InsertableDisplayWebsite = await request.json();
    const validationResult = FieldsUtil.checkDisplayWebsite(insertableWebsite)
    if (!validationResult.valid) {
        return NextResponse.json({message: validationResult.errors}, {status: 400});
    }

    // Génération d'un token d'authentification pour le site
    const website_token = PasswordUtil.generatePassword(32)
    const website_token_hashed = await PasswordUtil.hashPassword(website_token)

    // Insertion en base de données
    const sql = SqlUtil.getSql()
    const [inserted] = await sql`
        INSERT INTO display_websites (owner_id, website_domain, auth_token, hero_image_url, hero_title)
        VALUES (${user.id}, ${insertableWebsite.website_domain}, ${website_token_hashed}, ${insertableWebsite.hero_image_url},
                ${insertableWebsite.hero_title})
        RETURNING *
    `;

    // Vérification de l'insertion
    if (!inserted) {
        return NextResponse.json({message: "Error inserting website"}, {status: 500});
    }

    // Retour de la nouvelle ressource avec le token en clair, disponible uniquement une fois
    let website = inserted as DisplayWebsite;
    website.auth_token = website_token;
    return NextResponse.json(website, {status: 201});
}

export async function GET() {
    const user = await ApiUtil.getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }

    const sql = SqlUtil.getSql()
    const res = await sql`
        SELECT * FROM display_websites WHERE owner_id = ${user.id}
    `;

    return NextResponse.json((res), {status: 200});
}