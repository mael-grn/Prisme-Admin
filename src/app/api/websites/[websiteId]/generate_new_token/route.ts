import {NextResponse} from "next/server";
import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {PasswordUtil} from "@/app/utils/passwordUtil";
import {DisplayWebsite} from "@/app/models/DisplayWebsite";

export async function GET({ params }: { params: Promise<{ websiteId: string }> }) {

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

        // Génération d'un token d'authentification pour le site
        const website_token = PasswordUtil.generatePassword(32)
        const website_token_hashed = await PasswordUtil.hashPassword(website_token)

        await sql`
        UPDATE display_websites SET auth_token = ${website_token_hashed} WHERE id = ${website.id}
    `;

        return ApiUtil.getSuccessNextResponse<string>(website_token);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error)
    }

}