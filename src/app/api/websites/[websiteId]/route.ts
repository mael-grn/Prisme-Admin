import {DisplayWebsite, InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";

export async function GET(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

    try {
        const { websiteId } = await params;

        ApiUtil.checkParam(websiteId);

        const sql = SqlUtil.getSql()
        const [res] = await sql`
        SELECT * FROM display_websites WHERE id = ${websiteId} or website_domain = ${websiteId} LIMIT 1
    `;
        if (!res) {
            return ApiUtil.getErrorNextResponse("Website not found", undefined, 404);
        }
        return ApiUtil.getSuccessNextResponse<DisplayWebsite>(res as DisplayWebsite);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error)
    }

}

export async function DELETE(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

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

        //On supprime le site
        await sql`
        DELETE FROM display_websites WHERE id = ${website.id}
    `;

        return ApiUtil.getSuccessNextResponse()
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error)
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

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
        const insertableWebsite: InsertableDisplayWebsite = await request.json();

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableDisplayWebsite>(FieldsUtil.checkDisplayWebsite, insertableWebsite)

        await sql`UPDATE display_websites
              SET website_domain = ${insertableWebsite.website_domain},
                    hero_image_url = ${insertableWebsite.hero_image_url},
                    hero_title = ${insertableWebsite.hero_title}
              WHERE id = ${website.id}`;

        return ApiUtil.getSuccessNextResponse();
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error)
    }

}