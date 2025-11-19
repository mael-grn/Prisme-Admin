import {InsertableWebsiteColors} from "@/app/models/WebsiteColors";

export default class ColorUtil {

    static darkenHex(hexColor: string, amount: number = 0.2): string {
        // 1. Nettoyer la chaîne (retirer le '#')
        const hex = hexColor.replace('#', '');

        // Vérification basique de la longueur
        if (hex.length !== 6) {
            throw new Error("Format hexadécimal invalide. Utilisez le format 6 caractères (ex: FF0000).");
        }

        // 2. Convertir chaque composante (R, G, B) de l'hexadécimal vers un entier (0-255)
        // substring(0, 2) prend les deux premiers caractères pour le Rouge
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // 3. Appliquer l'assombrissement
        // On multiplie par (1 - amount) et on arrondit à l'entier inférieur
        r = Math.floor(r * (1 - amount));
        g = Math.floor(g * (1 - amount));
        b = Math.floor(b * (1 - amount));

        // 4. S'assurer que les valeurs restent positives (pas en dessous de 0)
        r = Math.max(0, r);
        g = Math.max(0, g);
        b = Math.max(0, b);

        // 5. Reconvertir en hexadécimal
        // padStart(2, '0') assure qu'on a bien "05" et pas juste "5" si le chiffre est petit
        const rr = r.toString(16).padStart(2, '0');
        const gg = g.toString(16).padStart(2, '0');
        const bb = b.toString(16).padStart(2, '0');

        return `#${rr}${gg}${bb}`;
    }

    static lightenHex(hexColor: string, amount: number = 0.2): string {
        // 1. Nettoyer la chaîne
        const hex = hexColor.replace('#', '');

        if (hex.length !== 6) {
            throw new Error("Format hexadécimal invalide. Utilisez 6 caractères.");
        }

        // 2. Convertir en entiers (0-255)
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);

        // 3. Appliquer l'éclaircissement (Mélange avec du blanc)
        // Formule : Valeur Actuelle + (Espace restant jusqu'à 255 * Pourcentage)
        r = Math.round(r + (255 - r) * amount);
        g = Math.round(g + (255 - g) * amount);
        b = Math.round(b + (255 - b) * amount);

        // 4. S'assurer que les valeurs ne dépassent pas 255 (le blanc pur)
        r = Math.min(255, r);
        g = Math.min(255, g);
        b = Math.min(255, b);

        // 5. Reconvertir en hexadécimal
        const rr = r.toString(16).padStart(2, '0');
        const gg = g.toString(16).padStart(2, '0');
        const bb = b.toString(16).padStart(2, '0');

        return `#${rr}${gg}${bb}`;
    }


    static autoContrastHex(hexColor: string, amount: number = 0.2, threshold: number = 128): string {
        const hex = hexColor.replace('#', '');

        if (hex.length !== 6) throw new Error("Format invalide (6 caractères requis)");

        // 1. Extraction RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        // 2. Calcul de la luminosité perçue (Formule standard W3C/YIQ)
        // Le vert pèse plus lourd car l'œil y est plus sensible.
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;

        // 3. Décision : Est-ce clair ou sombre ?
        const isLight = brightness > threshold;

        // 4. Application de la modification
        if (isLight) {
            return this.darkenHex(hexColor, amount);
        } else {
            return this.lightenHex(hexColor, amount);
        }
    }

    static setPrimaryColorAuto(colors: InsertableWebsiteColors, newPrimary: string): InsertableWebsiteColors {
        colors.primary_color = newPrimary;
        colors.primary_variant = this.autoContrastHex(newPrimary, 0.3);
        return colors;
    }

    static setSecondaryColorAuto(colors: InsertableWebsiteColors, newSecondary: string): InsertableWebsiteColors {
        colors.secondary_color = newSecondary;
        colors.secondary_variant = this.autoContrastHex(newSecondary, 0.3);
        return colors;
    }

    static setBackgroundColorAuto(colors: InsertableWebsiteColors, newBackground: string): InsertableWebsiteColors {
        colors.background_color = newBackground;
        colors.background_variant = this.autoContrastHex(newBackground, 0.1);
        colors.background_variant_variant = this.autoContrastHex(colors.background_variant, 0.1);
        return colors;
    }

    static setTextColorAuto(colors: InsertableWebsiteColors, newText: string): InsertableWebsiteColors {
        colors.text_color = newText;
        colors.text_variant = this.autoContrastHex(newText, 0.1);
        colors.text_variant_variant = this.autoContrastHex(colors.text_variant, 0.1);
        return colors;
    }
}