// typescript
import {InsertableUser} from "@/app/models/User";
import {InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import {InsertablePage} from "@/app/models/Page";
import {InsertableSection} from "@/app/models/Section";
import {InsertableElement} from "@/app/models/Element";
import {InsertableCategory} from "@/app/models/Category";
import {InsertableSubcategory} from "@/app/models/Subcategory";
import {InvalidFieldsError} from "@/app/errors/InvalidFieldsError";
import {InsertableWebsiteColors} from "@/app/models/WebsiteColors";

export type ValidationResult = { valid: boolean; errors: string[] };

export class FieldsUtil {
    private static isNonEmptyString(v: unknown) {
        return typeof v === "string" && v.trim().length > 0;
    }

    private static isInteger(v: unknown) {
        return typeof v === "number" && Number.isInteger(v);
    }

    private static isHexColor(v: unknown) {
        if (typeof v !== "string") return false;
        // accepts #RRGGBB or #RGB
        const re = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
        return re.test(v);
    }

    private static isPositiveInteger(v: unknown) {
        return this.isInteger(v) && (v as number) > 0;
    }

    private static isValidEmail(email: string) {
        // simple regex but useful for basic validation
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return re.test(email);
    }

    private static isValidDomain(domain: string) {
        // accepts "example.com" or "sub.example.co"
        const re = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
        return re.test(domain);
    }

    private static isValidUrl(url: string) {
        try {
            // accepts http(s) and valid data
            const u = new URL(url);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    }

    public static checkWebsiteColors(colors: InsertableWebsiteColors): ValidationResult {
        const errors: string[] = [];
        if (!colors) {
            return {valid: false, errors: ["colors are required"]};
        }

        if (!this.isHexColor(colors.primary_color)) {
            errors.push("The primary color is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.primary_variant)) {
            errors.push("The primary color variant is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.secondary_color)) {
            errors.push("The secondary color is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.secondary_variant)) {
            errors.push("The secondary color variant is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.background_color)) {
            errors.push("The background color is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.background_variant)) {
            errors.push("The background color variant is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.background_variant_variant)) {
            errors.push("The second background color variant is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.text_color)) {
            errors.push("The text color is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.text_variant)) {
            errors.push("The text color variant is not a valid hexadecimal code");
        }
        if (!this.isHexColor(colors.text_variant_variant)) {
            errors.push("The second text color variant is not a valid hexadecimal code");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkUser(user: InsertableUser): ValidationResult {
        const errors: string[] = [];
        if (!user) {
            return {valid: false, errors: ["user is required"]};
        }

        if (!this.isNonEmptyString(user.email)) {
            errors.push("email is required and must be a non-empty string");
        } else if (!this.isValidEmail(user.email)) {
            errors.push("email does not have a valid format");
        }

        if (!this.isNonEmptyString(user.first_name)) {
            errors.push("firstName is required and must be a non-empty string");
        }

        if (!this.isNonEmptyString(user.last_name)) {
            errors.push("lastName is required and must be a non-empty string");
        }

        if (!this.isNonEmptyString(user.password)) {
            errors.push("password is required and must be a non-empty string");
        } else if (user.password.length < 8) {
            errors.push("password must contain at least 8 characters");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkDisplayWebsite(w: InsertableDisplayWebsite): ValidationResult {
        const errors: string[] = [];
        if (!w) return {valid: false, errors: ["display website is required"]};

        if (!this.isPositiveInteger(w.owner_id)) {
            errors.push("ownerId is required and must be a positive integer (referencing users)");
        }

        if (!this.isNonEmptyString(w.title)) {
            errors.push("the website must have a name");
        }

        if (!this.isNonEmptyString(w.hero_title)) {
            errors.push("the website must have a title on the home page");
        }

        if (this.isNonEmptyString(w.website_domain)) {
            const domain = w.website_domain!;
            if (!this.isValidDomain(domain) && !this.isValidDomain(domain)) {
                errors.push("domain must be a valid domain name (e.g., example.com) or a URL");
            }
            if (domain.endsWith("/")) {
                errors.push("domain must not end with '/'");
            }
        }

        if (w.hero_image_url !== undefined && w.hero_image_url !== null && w.hero_image_url !== "") {
            if (typeof w.hero_image_url !== "string") {
                errors.push("heroImageUrl must be a string if provided");
            } else if (!this.isValidUrl(w.hero_image_url)) {
                errors.push("heroImageUrl must be a valid URL (http(s)://...)");
            }
        }

        if (w.hero_title !== undefined && w.hero_title !== null) {
            if (typeof w.hero_title !== "string") {
                errors.push("heroTitle must be a string if provided");
            } else if (w.hero_title.length > 300) {
                errors.push("heroTitle is too long (recommended limit 300 characters)");
            }
        }

        // Note: auth_token exists in database but is not in InsertableDisplayWebsite:
        // creation must generate/assign auth_token server-side.

        return {valid: errors.length === 0, errors};
    }

    public static checkPage(p: InsertablePage): ValidationResult {
        const errors: string[] = [];
        if (!p) return {valid: false, errors: ["page is required"]};

        if (!this.isNonEmptyString(p.path)) {
            errors.push("path is required and must be a non-empty string");
        } else {
            // logic: path must start with '/'
            if (!p.path.startsWith("/")) {
                errors.push("path should start with '/'");
            }
            if (/\s/.test(p.path)) {
                errors.push("path must not contain spaces");
            }
            if (p.path.length > 500) {
                errors.push("path is too long");
            }
        }

        if (!this.isPositiveInteger(p.website_id)) {
            errors.push("websiteId is required and must be a positive integer (referencing display_websites)");
        }

        // title (mandatory)
        if (!this.isNonEmptyString(p.title)) {
            errors.push("title is required and must be a non-empty string");
        } else if (p.title.length > 300) {
            errors.push("title is too long (recommended limit 300 characters)");
        }

        // icon_svg (optional) — if provided must be a string
        if (p.icon_svg !== undefined && p.icon_svg !== null && p.icon_svg !== "") {
            if (typeof p.icon_svg !== "string") {
                errors.push("icon_svg must be a string if provided");
            } else {
                const svgRe = /^\s*(<\?xml[\s\S]*?\?>\s*)?(<svg\b[^>]*>[\s\S]*?<\/svg>|<svg\b[^>]*\/>)\s*$/i;
                if (!svgRe.test(p.icon_svg)) {
                    errors.push("icon_svg must be a valid SVG");
                } else if (p.icon_svg.length > 2000) {
                    errors.push("icon_svg is too long");
                }
            }
        }

        // description (optional) — if provided must be a string
        if (p.description !== undefined && p.description !== null) {
            if (typeof p.description !== "string") {
                errors.push("description must be a string if provided");
            } else if (p.description.length > 2000) {
                errors.push("description is too long");
            }
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkSection(s: InsertableSection): ValidationResult {
        const errors: string[] = [];
        if (!s) return {valid: false, errors: ["section is required"]};

        if (!this.isPositiveInteger(s.page_id)) {
            errors.push("pageId is required and must be a positive integer (referencing pages)");
        }

        if (!this.isInteger(s.position)) {
            errors.push("position is required and must be an integer");
        } else if ((s.position as number) < 0) {
            errors.push("position must be >= 0");
        }

        if (!this.isNonEmptyString(s.section_type)) {
            errors.push("type is required and must be a non-empty string (element_type in DB)");
        } else if (s.section_type.length > 100) {
            errors.push("type is too long");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkElement(e: InsertableElement): ValidationResult {
        const errors: string[] = [];
        if (!e) return {valid: false, errors: ["element is required"]};

        if (!this.isPositiveInteger(e.section_id)) {
            errors.push("sectionId is required and must be a positive integer (referencing sections)");
        }

        if (!this.isNonEmptyString(e.element_type)) {
            errors.push("type is required and must be a non-empty string (element_type in DB)");
        } else if (e.element_type.length > 100) {
            errors.push("type is too long");
        }

        if (e.element_type === "image") return {valid: errors.length === 0, errors};

        if (!this.isNonEmptyString(e.content)) {
            errors.push("content is required and must be a non-empty string");
        }

        switch (e.element_type) {
            case "lien":
                if (!this.isValidUrl(e.content)) {
                    errors.push("url is required for a link");
                }
                break;
            case "titre":
                if (e.content.length > 50) {
                    errors.push("the title must not exceed 50 characters");
                }
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkCategory(c: InsertableCategory): ValidationResult {
        const errors: string[] = [];
        if (!c) return {valid: false, errors: ["category is required"]};

        if (!this.isNonEmptyString(c.name)) {
            errors.push("name is required and must be a non-empty string");
        } else if (c.name.length > 200) {
            errors.push("name is too long");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkSubCategory(sc: InsertableSubcategory): ValidationResult {
        const errors: string[] = [];
        if (!sc) return {valid: false, errors: ["subcategory is required"]};

        if (!this.isPositiveInteger(sc.category_id)) {
            errors.push("categoryId is required and must be a positive integer (referencing categories)");
        }

        if (!this.isNonEmptyString(sc.name)) {
            errors.push("name is required and must be a non-empty string");
        } else if (sc.name.length > 200) {
            errors.push("name is too long");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkFieldsOrThrow<T>(validationFunction: (obj: T) => ValidationResult, obj: T) {
        // call the validation function with `FieldsUtil` as `this` to preserve access
        const validation = validationFunction.call(FieldsUtil, obj);
        if (!validation.valid) {
            throw new InvalidFieldsError();
        }
    }
}