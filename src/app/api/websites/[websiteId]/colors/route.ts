import {ApiUtil} from "@/app/utils/apiUtil";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import {InsertableWebsiteColors, WebsiteColors} from "@/app/models/WebsiteColors";

export async function POST(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

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
        const insertableColors: InsertableWebsiteColors = await request.json();

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableWebsiteColors>(FieldsUtil.checkWebsiteColors, insertableColors)

        await sql`INSERT INTO website_colors (website_id, primary_color, primary_variant, secondary_color, secondary_variant, background_color, background_variant, background_variant_variant, text_color, text_variant, text_variant_variant)
              VALUES (${website.id}, ${insertableColors.primary_color}, ${insertableColors.primary_variant}, ${insertableColors.secondary_color}, ${insertableColors.secondary_variant}, ${insertableColors.background_color}, ${insertableColors.background_variant}, ${insertableColors.background_variant_variant}, ${insertableColors.text_color}, ${insertableColors.text_variant}, ${insertableColors.text_variant_variant})
              `;

        return ApiUtil.getSuccessNextResponse(undefined, true);
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
        const insertableColors: InsertableWebsiteColors = await request.json();

        // Validation des données
        FieldsUtil.checkFieldsOrThrow<InsertableWebsiteColors>(FieldsUtil.checkWebsiteColors, insertableColors)

        await sql`UPDATE website_colors SET primary_color = ${insertableColors.primary_color}, primary_variant = ${insertableColors.primary_variant}, secondary_color = ${insertableColors.secondary_color}, secondary_variant = ${insertableColors.secondary_variant}, background_color = ${insertableColors.background_color}, background_variant = ${insertableColors.background_variant}, background_variant_variant = ${insertableColors.background_variant_variant}, text_color = ${insertableColors.text_color}, text_variant = ${insertableColors.text_variant}, text_variant_variant = ${insertableColors.text_variant_variant} WHERE website_id = ${website.id}`;

        return ApiUtil.getSuccessNextResponse(undefined, true);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error)
    }
}

export async function GET(request: Request, { params }: { params: Promise<{ websiteId: string }> }) {

    try {
        const { websiteId } = await params;

        ApiUtil.checkParam(websiteId);

        const sql = SqlUtil.getSql()
        const res = await sql`
        SELECT * FROM website_colors WHERE website_id = ${websiteId} LIMIT 1`;
        if (res.length === 0) {
            return ApiUtil.getErrorNextResponse("No colors found for this website", undefined, 404);
        }
        return ApiUtil.getSuccessNextResponse<WebsiteColors>(res[0] as WebsiteColors);
    } catch (e) {
        return ApiUtil.handleNextErrors(e as Error)
    }

}