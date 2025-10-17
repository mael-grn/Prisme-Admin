import {NextResponse} from "next/server";
import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {PasswordUtil} from "@/app/utils/passwordUtil";

export async function GET({ params }: { params: Promise<{ websiteId: string }> }) {
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

    // Génération d'un token d'authentification pour le site
    const website_token = PasswordUtil.generatePassword(32)
    const website_token_hashed = await PasswordUtil.hashPassword(website_token)

    await sql`
        UPDATE display_websites SET auth_token = ${website_token_hashed} WHERE id = ${website.id}
    `;

    return NextResponse.json((website_token), {status: 200});
}