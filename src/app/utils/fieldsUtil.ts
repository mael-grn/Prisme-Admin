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
        // accepte #RRGGBB ou #RGB
        const re = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
        return re.test(v);
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

    public static checkWebsiteColors(colors: InsertableWebsiteColors): ValidationResult {
        const errors: string[] = [];
        if (!colors) {
            return {valid: false, errors: ["les couleurs sont requises"]};
        }

        if (!this.isHexColor(colors.primary_color)) {
            errors.push("La couleur primaire n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.primary_variant)) {
            errors.push("La variante de la couleur primaire n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.secondary_color)) {
            errors.push("La couleur secondaire n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.secondary_variant)) {
            errors.push("La variante de la couleur secondaire n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.background_color)) {
            errors.push("La couleur de fond n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.background_variant)) {
            errors.push("La variante de la couleur de fond n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.background_variant_variant)) {
            errors.push("La seconde variante de la couleur de fond n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.text_color)) {
            errors.push("La couleur du texte n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.text_variant)) {
            errors.push("La variante de la couleur du texte n'est pas un code hexadécimal valide");
        }
        if (!this.isHexColor(colors.text_variant_variant)) {
            errors.push("La seconde variante de la couleur du texte n'est pas un code hexadécimal valide");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkUser(user: InsertableUser): ValidationResult {
        const errors: string[] = [];
        if (!user) {
            return {valid: false, errors: ["user est requis"]};
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

        return {valid: errors.length === 0, errors};
    }

    public static checkDisplayWebsite(w: InsertableDisplayWebsite): ValidationResult {
        const errors: string[] = [];
        if (!w) return {valid: false, errors: ["display website est requis"]};

        if (!this.isPositiveInteger(w.owner_id)) {
            errors.push("ownerId est requis et doit être un entier positif (référence utilisateurs)");
        }

        if (!this.isNonEmptyString(w.title)) {
            errors.push("le site doit avoir un nom");
        }

        if (!this.isNonEmptyString(w.hero_title)) {
            errors.push("le site doit avoir un titre sur la page d'accueil");
        }

        if (this.isNonEmptyString(w.website_domain)) {
            const domain = w.website_domain!;
            if (!this.isValidDomain(domain) && !this.isValidDomain(domain)) {
                errors.push("domain doit être un nom de domaine valide (ex: example.com) ou une URL");
            }
            if (domain.endsWith("/")) {
                errors.push("domain ne doit pas se terminer par '/'");
            }
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

        return {valid: errors.length === 0, errors};
    }

    public static checkPage(p: InsertablePage): ValidationResult {
        const errors: string[] = [];
        if (!p) return {valid: false, errors: ["page est requise"]};

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
            } else {
                const svgRe = /^\s*(<\?xml[\s\S]*?\?>\s*)?(<svg\b[^>]*>[\s\S]*?<\/svg>|<svg\b[^>]*\/>)\s*$/i;
                if (!svgRe.test(p.icon_svg)) {
                    errors.push("icon_svg doit être un SVG valide");
                } else if (p.icon_svg.length > 2000) {
                    errors.push("icon_svg est trop long");
                }
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

        return {valid: errors.length === 0, errors};
    }

    public static checkSection(s: InsertableSection): ValidationResult {
        const errors: string[] = [];
        if (!s) return {valid: false, errors: ["section est requise"]};

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

        return {valid: errors.length === 0, errors};
    }

    public static checkElement(e: InsertableElement): ValidationResult {
        const errors: string[] = [];
        if (!e) return {valid: false, errors: ["element est requis"]};

        if (!this.isPositiveInteger(e.section_id)) {
            errors.push("sectionId est requis et doit être un entier positif (référence sections)");
        }

        if (!this.isNonEmptyString(e.element_type)) {
            errors.push("type est requis et doit être une chaîne non vide (element_type en DB)");
        } else if (e.element_type.length > 100) {
            errors.push("type est trop long");
        }

        if (e.element_type === "image") return {valid: errors.length === 0, errors};

        if (!this.isNonEmptyString(e.content)) {
            errors.push("content est requis et doit être une chaîne non vide");
        }

        switch (e.element_type) {
            case "lien":
                if (!this.isValidUrl(e.content)) {
                    errors.push("url est requis pour un lien");
                }
                break;
            case "titre":
                if (e.content.length > 50) {
                    errors.push("le titre ne dois pas faire plus de 50 caractères");
                }
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkCategory(c: InsertableCategory): ValidationResult {
        const errors: string[] = [];
        if (!c) return {valid: false, errors: ["category est requise"]};

        if (!this.isNonEmptyString(c.name)) {
            errors.push("name est requis et doit être une chaîne non vide");
        } else if (c.name.length > 200) {
            errors.push("name est trop long");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkSubCategory(sc: InsertableSubcategory): ValidationResult {
        const errors: string[] = [];
        if (!sc) return {valid: false, errors: ["subcategory est requise"]};

        if (!this.isPositiveInteger(sc.category_id)) {
            errors.push("categoryId est requis et doit être un entier positif (référence categories)");
        }

        if (!this.isNonEmptyString(sc.name)) {
            errors.push("name est requis et doit être une chaîne non vide");
        } else if (sc.name.length > 200) {
            errors.push("name est trop long");
        }

        return {valid: errors.length === 0, errors};
    }

    public static checkFieldsOrThrow<T>(validationFunction: (obj: T) => ValidationResult, obj: T) {
        // appeler la fonction de validation avec `FieldsUtil` comme `this` pour préserver l'accès
        const validation = validationFunction.call(FieldsUtil, obj);
        if (!validation.valid) {
            throw new InvalidFieldsError();
        }
    }
}