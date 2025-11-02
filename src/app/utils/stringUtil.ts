export class StringUtil {
    static getErrorMessageFromStatus(
        status: number,
        customMessage?: { code: number, message: string }
    ): string {
        if (customMessage && customMessage.code === status) {
            return `${customMessage.message} (${status})`;
        }
        switch (status) {
            case 400:
                return "La requête envoyée est invalide. Veuillez vérifier les informations saisies et réessayer. (400)";
            case 401:
                return "Vous devez être connecté pour accéder à cette ressource. Merci de vous authentifier. (401)";
            case 403:
                return "Vous n’avez pas les droits nécessaires pour effectuer cette action. Si besoin, contactez un administrateur. (403)";
            case 404:
                return "La ressource demandée est introuvable. Vérifiez l’URL ou réessayez plus tard. (404)";
            case 409:
                return "Un conflit a été détecté avec les données existantes. Veuillez vérifier vos informations et réessayer. (409)";
            case 422:
                return "Certaines données fournies ne sont pas valides. Merci de corriger les champs indiqués et de réessayer. (422)";
            case 429:
                return "Vous avez effectué trop de requêtes en peu de temps. Merci de patienter avant de réessayer. (429)";
            case 500:
                return "Une erreur interne est survenue sur le serveur. Veuillez réessayer plus tard ou contacter le support si le problème persiste. (500)";
            case 502:
                return "Le serveur a reçu une réponse invalide. Merci de réessayer ultérieurement. (502)";
            case 503:
                return "Le service est temporairement indisponible. Merci de réessayer dans quelques instants. (503)";
            case 504:
                return "Le délai d’attente a été dépassé. Veuillez vérifier votre connexion ou réessayer plus tard. (504)";
            case -1:
                return "Une erreur s'est produite dans l'application. Merci de réessayer ou de contacter le support.";
            default:
                return `Une erreur inattendue est survenue. Merci de réessayer ou de contacter le support. (${status})`;
        }
    }

    static basicStringValidator(value: string, minLength?: number, maxLength?: number): string | null {
        const invalidCaracters = /[!@#$%^&*(),.?":{}|<>]/g;

        if (value.length < (minLength || 2) || (maxLength && value.length > maxLength)) return `Le texte doit contenir entre ${minLength || 2} et ${maxLength || "un nombre infini de"} caractères.`;
        else if (invalidCaracters.test(value)) return "Le texte ne doit pas contenir de caractères spéciaux.";
        else return null;
    }

    static passwordStringValidator(password: string): string | null {
        if (password.length < 8) return "Le mot de passe doit contenir au moins 8 caractères.";
        return null;
    }

    static pathStringValidator(path: string): string | null {
        if (!path.startsWith("/") || path.length < 2 || path.includes(' ')) return "Le chemin doit commencer par '/' et ne pas contenir d'espaces.";
        return null;
    }

    static emailStringValidator(email: string): string | null {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "L'adresse email n'est pas valide.";
        return null;
    }

    static domainValidator(domain: string): string | null {
        const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;
        if (!domainRegex.test(domain)) return "Le domaine n'est pas valide.";
        return null;
    }

    static truncateString(str: string, num: number): string {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + '...';
    }

}