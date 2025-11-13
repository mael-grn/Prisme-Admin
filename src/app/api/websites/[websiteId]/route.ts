import type {DisplayWebsite, InsertableDisplayWebsite, RecursiveWebsite} from "@/app/models/DisplayWebsite";
import {SqlUtil} from "@/app/utils/sqlUtil";
import {ApiUtil} from "@/app/utils/apiUtil";
import {FieldsUtil} from "@/app/utils/fieldsUtil";
import type {RecursivePage, Page} from "@/app/models/Page";
import type {Section, RecursiveSection} from "@/app/models/Section";
import type {Element} from "@/app/models/Element";
import type {RecursiveCategory} from "@/app/models/Category";
import type {Subcategory} from "@/app/models/Subcategory";
import {StringUtil} from "@/app/utils/stringUtil";

interface SectionsCategoryRow {
    section_id: number;
    category_id: number;
    category_name: string;
    subcategory_id: number;
    subcategory_name: string;
    sc_category_id: number;
}

export async function GET(request: Request, {params}: { params: Promise<{ websiteId: string }> }) {
    try {
        const {websiteId} = await params;
        ApiUtil.checkParam(websiteId);

        const sql = SqlUtil.getSql();
        let res;
        if (StringUtil.isInteger(websiteId)) {
            const id = Number(websiteId);
            [res] = await sql`SELECT *
                              FROM display_websites
                              WHERE id = ${id}
                              LIMIT 1`;
        } else if ((websiteId as string).includes(".")) {
            [res] = await sql`SELECT *
                              FROM display_websites
                              WHERE website_domain = ${websiteId}
                              LIMIT 1`;
        } else {
            [res] = await sql`SELECT *
                              FROM display_websites
                              WHERE title = ${(websiteId as string).replaceAll('%20', ' ')}
                              LIMIT 1`;
        }

        if (!res) {
            return ApiUtil.getErrorNextResponse("Website not found", undefined, 404);
        }

        if (res.website_domain && (res.website_domain === "" || res.website_domain === "null" || res.website_domain === null)) {
            res.website_domain = undefined;
        }

        if (!ApiUtil.isRecursiveRequest(request)) {
            return ApiUtil.getSuccessNextResponse<DisplayWebsite>(res as DisplayWebsite);
        }

        // 1) Récupérer toutes les pages du site (ordre par position)
        const pages = (await sql`SELECT *
                                 FROM pages
                                 WHERE website_id = ${res.id}
                                 ORDER BY position`) as Page[];

        const pageIds = pages.map((p) => p.id);

        // 2) Récupérer les sections pour ces pages
        const sections = pageIds.length
            ? (await sql`SELECT *
                         FROM sections
                         WHERE page_id = ANY (${pageIds})
                         ORDER BY position`) as Section[]
            : ([] as Section[]);

        const sectionIds = sections.map((s) => s.id);

        // 3) Récupérer les éléments pour ces sections
        const elements = sectionIds.length
            ? (await sql`SELECT *
                         FROM elements
                         WHERE section_id = ANY (${sectionIds})
                         ORDER BY position`) as Element[]
            : ([] as Element[]);

        // 4) Récupérer les catégories + sous-catégories liées aux sections
        const catRows = sectionIds.length
            ? (await sql`
                    SELECT ssc.section_id,
                           c.id           AS category_id,
                           c.name         AS category_name,
                           sc.id          AS subcategory_id,
                           sc.name        AS subcategory_name,
                           sc.category_id AS sc_category_id
                    FROM sections_subcategories ssc
                             JOIN subcategories sc ON sc.id = ssc.subcategory_id
                             JOIN categories c ON c.id = sc.category_id
                    WHERE ssc.section_id = ANY (${sectionIds})
                    ORDER BY c.id, sc.id
            `) as SectionsCategoryRow[]
            : ([] as SectionsCategoryRow[]);

        // Assemblage en mémoire
        const elementsBySection = new Map<number, Element[]>();
        for (const el of elements) {
            const arr = elementsBySection.get(el.section_id) ?? [];
            arr.push({
                id: el.id,
                section_id: el.section_id,
                element_type: el.element_type,
                position: el.position,
                content: el.content
            });
            elementsBySection.set(el.section_id, arr);
        }

        // categoriesBySection => Map<sectionId, Map<categoryId, RecursiveCategory>>
        const categoriesBySection = new Map<number, Map<number, RecursiveCategory>>();
        for (const row of catRows) {
            let catMap = categoriesBySection.get(row.section_id);
            if (!catMap) {
                catMap = new Map<number, RecursiveCategory>();
                categoriesBySection.set(row.section_id, catMap);
            }
            let cat = catMap.get(row.category_id);
            if (!cat) {
                cat = {
                    id: row.category_id,
                    name: row.category_name,
                    subcategories: [] as Subcategory[]
                };
                catMap.set(row.category_id, cat);
            }
            cat.subcategories.push({
                id: row.subcategory_id,
                category_id: row.sc_category_id,
                name: row.subcategory_name
            });
        }

        // Construire sections groupées par page
        const sectionsByPage = new Map<number, RecursiveSection[]>();
        for (const s of sections) {
            const arr = sectionsByPage.get(s.page_id) ?? [];
            const secCategoriesMap = categoriesBySection.get(s.id);
            const categories = secCategoriesMap ? Array.from(secCategoriesMap.values()) : [];

            arr.push({
                id: s.id,
                title: s.title,
                page_id: s.page_id,
                position: s.position,
                section_type: s.section_type,
                categories,
                elements: elementsBySection.get(s.id) ?? []
            });
            sectionsByPage.set(s.page_id, arr);
        }

        // Construire pages récursives
        const recursivePages: RecursivePage[] = pages.map((p) => ({
            id: p.id,
            path: p.path,
            website_id: p.website_id,
            sections: sectionsByPage.get(p.id) ?? [],
            icon_svg: p.icon_svg ?? undefined,
            title: p.title,
            description: p.description ?? undefined,
            position: p.position
        }));

        const recursiveWebsite: RecursiveWebsite = {
            id: res.id,
            owner_id: res.owner_id,
            title: res.title,
            website_domain: res.website_domain,
            auth_token: res.auth_token,
            hero_image_url: res.hero_image_url,
            hero_title: res.hero_title,
            pages: recursivePages
        };

        return ApiUtil.getSuccessNextResponse<RecursiveWebsite>(recursiveWebsite);
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}

export async function DELETE(request: Request, {params}: { params: Promise<{ websiteId: string }> }) {
    try {
        const {websiteId} = await params;
        ApiUtil.checkParam(websiteId);

        const user = await ApiUtil.getConnectedUser();
        const sql = SqlUtil.getSql();

        let website;
        if (StringUtil.isInteger(websiteId)) {
            const id = Number(websiteId);
            [website] = await sql`SELECT *
                                  FROM display_websites
                                  WHERE id = ${id}
                                  LIMIT 1`;
        } else {
            [website] = await sql`SELECT *
                                  FROM display_websites
                                  WHERE website_domain = ${websiteId}
                                  LIMIT 1`;
        }

        if (!website) {
            return ApiUtil.getErrorNextResponse("Website not found", undefined, 404);
        }

        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner of this website", undefined, 403);
        }

        await sql`DELETE
                  FROM display_websites
                  WHERE id = ${website.id}`;
        return ApiUtil.getSuccessNextResponse();
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}

export async function PUT(request: Request, {params}: { params: Promise<{ websiteId: string }> }) {
    try {
        const {websiteId} = await params;
        ApiUtil.checkParam(websiteId);

        const user = await ApiUtil.getConnectedUser();
        const sql = SqlUtil.getSql();

        let website;
        if (StringUtil.isInteger(websiteId)) {
            const id = Number(websiteId);
            [website] = await sql`SELECT *
                                  FROM display_websites
                                  WHERE id = ${id}
                                  LIMIT 1`;
        } else {
            [website] = await sql`SELECT *
                                  FROM display_websites
                                  WHERE website_domain = ${websiteId}
                                  LIMIT 1`;
        }

        if (!website) {
            return ApiUtil.getErrorNextResponse("Website not found", undefined, 404);
        }

        if (website.owner_id !== user.id) {
            return ApiUtil.getErrorNextResponse("You are not the owner of this website", undefined, 403);
        }

        const insertableWebsite: InsertableDisplayWebsite = await request.json();
        FieldsUtil.checkFieldsOrThrow<InsertableDisplayWebsite>(FieldsUtil.checkDisplayWebsite, insertableWebsite);

        await sql`
            UPDATE display_websites
            SET website_domain = ${insertableWebsite.website_domain},
                hero_image_url = ${insertableWebsite.hero_image_url},
                hero_title     = ${insertableWebsite.hero_title},
                title     = ${insertableWebsite.title}
            WHERE id = ${website.id}
        `;

        return ApiUtil.getSuccessNextResponse();
    } catch (error) {
        return ApiUtil.handleNextErrors(error as Error);
    }
}