// typescript
import { InsertableUser } from "@/app/models/User";
import { InsertableDisplayWebsite } from "@/app/models/DisplayWebsite";
import { InsertablePage } from "@/app/models/Page";
import { InsertableSection } from "@/app/models/Section";
import { InsertableElement } from "@/app/models/Element";
import { InsertableCategory } from "@/app/models/Category";
import { InsertableSubcategory } from "@/app/models/Subcategory";

export type ValidationResult = { valid: boolean; errors: string[] };

export default class FieldsUtil {
    private static isNonEmptyString(v: unknown) {
        return typeof v === "string" && v.trim().length > 0;
    }

    private static isInteger(v: unknown) {
        return typeof v === "number" && Number.isInteger(v);
    }

    private static isPositiveInteger(v: unknown) {
        return this.isInteger(v) && (v as number) > 0;
    }

    private static isValidEmail(email: string) {
        // regex simple mais pratique pour validation basique
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
        return re.test(email);
    }

    private static isValidDomain(domain: string) {
        // accepte "example.com" ou "sub.example.co"
        const re = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$/;
        return re.test(domain);
    }

    private static isValidUrl(url: string) {
        try {
            // accepte http(s) et données valides
            const u = new URL(url);
            return u.protocol === "http:" || u.protocol === "https:";
        } catch {
            return false;
        }
    }

    public static checkUser(user: InsertableUser): ValidationResult {
        const errors: string[] = [];
        if (!user) {
            return { valid: false, errors: ["user est requis"] };
        }

        if (!this.isNonEmptyString(user.email)) {
            errors.push("email est requis et doit être une chaîne non vide");
        } else if (!this.isValidEmail(user.email)) {
            errors.push("email n'a pas un format valide");
        }

        if (!this.isNonEmptyString(user.first_name)) {
            errors.push("firstName est requis et doit être une chaîne non vide");
        }

        if (!this.isNonEmptyString(user.last_name)) {
            errors.push("lastName est requis et doit être une chaîne non vide");
        }

        if (!this.isNonEmptyString(user.password)) {
            errors.push("password est requis et doit être une chaîne non vide");
        } else if (user.password.length < 8) {
            errors.push("password doit contenir au moins 8 caractères");
        }

        return { valid: errors.length === 0, errors };
    }

    public static checkDisplayWebsite(w: InsertableDisplayWebsite): ValidationResult {
        const errors: string[] = [];
        if (!w) return { valid: false, errors: ["display website est requis"] };

        if (!this.isPositiveInteger(w.owner_id)) {
            errors.push("ownerId est requis et doit être un entier positif (référence utilisateurs)");
        }

        if (!this.isNonEmptyString(w.website_domain)) {
            errors.push("domain est requis et doit être une chaîne non vide");
        } else if (!this.isValidDomain(w.website_domain) && !this.isValidUrl(w.website_domain)) {
            // accepter domaine simple ou URL
            errors.push("domain doit être un nom de domaine valide (ex: example.com) ou une URL");
        }

        if (w.hero_image_url !== undefined && w.hero_image_url !== null && w.hero_image_url !== "") {
            if (typeof w.hero_image_url !== "string") {
                errors.push("heroImageUrl doit être une chaîne si fournie");
            } else if (!this.isValidUrl(w.hero_image_url)) {
                errors.push("heroImageUrl doit être une URL valide (http(s)://...)");
            }
        }

        if (w.hero_title !== undefined && w.hero_title !== null) {
            if (typeof w.hero_title !== "string") {
                errors.push("heroTitle doit être une chaîne si fournie");
            } else if (w.hero_title.length > 300) {
                errors.push("heroTitle est trop long (limite 300 caractères recommandée)");
            }
        }

        // Note: auth_token existe en base mais n'est pas dans InsertableDisplayWebsite :
        // la création doit générer/assigner auth_token serveur-side.

        return { valid: errors.length === 0, errors };
    }

    public static checkPage(p: InsertablePage): ValidationResult {
        const errors: string[] = [];
        if (!p) return { valid: false, errors: ["page est requise"] };

        if (!this.isNonEmptyString(p.path)) {
            errors.push("path est requis et doit être une chaîne non vide");
        } else {
            // logique : path doit commencer par '/'
            if (!p.path.startsWith("/")) {
                errors.push("path devrait commencer par '/'");
            }
            if (/\s/.test(p.path)) {
                errors.push("path ne doit pas contenir d'espaces");
            }
            if (p.path.length > 500) {
                errors.push("path est trop long");
            }
        }

        if (!this.isPositiveInteger(p.website_id)) {
            errors.push("websiteId est requis et doit être un entier positif (référence display_websites)");
        }

        // title (obligatoire)
        if (!this.isNonEmptyString(p.title)) {
            errors.push("title est requis et doit être une chaîne non vide");
        } else if (p.title.length > 300) {
            errors.push("title est trop long (limite 300 caractères recommandée)");
        }

        // icon_svg (optionnel) — si fourni doit être une chaîne
        if (p.icon_svg !== undefined && p.icon_svg !== null && p.icon_svg !== "") {
            if (typeof p.icon_svg !== "string") {
                errors.push("icon_svg doit être une chaîne si fournie");
            } else if (p.icon_svg.length > 2000) {
                errors.push("icon_svg est trop long");
            }
        }

        // description (optionnel) — si fourni doit être une chaîne
        if (p.description !== undefined && p.description !== null) {
            if (typeof p.description !== "string") {
                errors.push("description doit être une chaîne si fournie");
            } else if (p.description.length > 2000) {
                errors.push("description est trop longue");
            }
        }

        // position (obligatoire)
        if (!this.isInteger(p.position)) {
            errors.push("position est requis et doit être un entier");
        } else if ((p.position as number) < 0) {
            errors.push("position doit être >= 0");
        }

        return { valid: errors.length === 0, errors };
    }

    public static checkSection(s: InsertableSection): ValidationResult {
        const errors: string[] = [];
        if (!s) return { valid: false, errors: ["section est requise"] };

        if (!this.isPositiveInteger(s.page_id)) {
            errors.push("pageId est requis et doit être un entier positif (référence pages)");
        }

        if (!this.isInteger(s.position)) {
            errors.push("position est requis et doit être un entier");
        } else if ((s.position as number) < 0) {
            errors.push("position doit être >= 0");
        }

        if (!this.isNonEmptyString(s.section_type)) {
            errors.push("type est requis et doit être une chaîne non vide (element_type en DB)");
        } else if (s.section_type.length > 100) {
            errors.push("type est trop long");
        }

        return { valid: errors.length === 0, errors };
    }

    public static checkElement(e: InsertableElement): ValidationResult {
        const errors: string[] = [];
        if (!e) return { valid: false, errors: ["element est requis"] };

        if (!this.isPositiveInteger(e.section_id)) {
            errors.push("sectionId est requis et doit être un entier positif (référence sections)");
        }

        if (!this.isNonEmptyString(e.element_type)) {
            errors.push("type est requis et doit être une chaîne non vide (element_type en DB)");
        } else if (e.element_type.length > 100) {
            errors.push("type est trop long");
        }

        if (!this.isInteger(e.position)) {
            errors.push("position est requis et doit être un entier");
        } else if ((e.position as number) < 0) {
            errors.push("position doit être >= 0");
        }

        if (!this.isNonEmptyString(e.content)) {
            errors.push("content est requis et doit être une chaîne non vide");
        }

        return { valid: errors.length === 0, errors };
    }

    public static checkCategory(c: InsertableCategory): ValidationResult {
        const errors: string[] = [];
        if (!c) return { valid: false, errors: ["category est requise"] };

        if (!this.isNonEmptyString(c.name)) {
            errors.push("name est requis et doit être une chaîne non vide");
        } else if (c.name.length > 200) {
            errors.push("name est trop long");
        }

        return { valid: errors.length === 0, errors };
    }

    public static checkSubCategory(sc: InsertableSubcategory): ValidationResult {
        const errors: string[] = [];
        if (!sc) return { valid: false, errors: ["subcategory est requise"] };

        if (!this.isPositiveInteger(sc.category_id)) {
            errors.push("categoryId est requis et doit être un entier positif (référence categories)");
        }

        if (!this.isNonEmptyString(sc.name)) {
            errors.push("name est requis et doit être une chaîne non vide");
        } else if (sc.name.length > 200) {
            errors.push("name est trop long");
        }

        return { valid: errors.length === 0, errors };
    }
}