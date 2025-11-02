import {DisplayWebsite, InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";

/**
 * Create a new display website for the connected user
 * @param request
 * @constructor
 */
export async function POST(request: Request) {
    try {

        // Récupération de l'utilisateur connecté
        const user = await ApiUtil.getConnectedUser();

        // Récupération des données dans le body
        const insertableWebsite: InsertableDisplayWebsite = await request.json();

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableDisplayWebsite>(FieldsUtil.checkDisplayWebsite, insertableWebsite);

        insertableWebsite.website_domain = insertableWebsite.website_domain.replaceAll(".", "-");
        // Insertion en base de données
        const sql = SqlUtil.getSql()
        await sql`
            INSERT INTO display_websites (owner_id, website_domain, hero_image_url, hero_title)
            VALUES (${user.id}, ${insertableWebsite.website_domain},
                    ${insertableWebsite.hero_image_url},
                    ${insertableWebsite.hero_title})
        `

        // Retour de la nouvelle ressource avec le token en clair, disponible uniquement une fois
        return ApiUtil.getSuccessNextResponse();
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}

export async function GET() {
    try {
        const user = await ApiUtil.getConnectedUser();

        const sql = SqlUtil.getSql()
        const res = await sql`
            SELECT *
            FROM display_websites
            WHERE owner_id = ${user.id}
        `;
        return ApiUtil.getSuccessNextResponse<DisplayWebsite[]>(res as DisplayWebsite[]);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }

}