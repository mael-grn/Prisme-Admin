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
                return "The sent request is invalid. Please check the entered information and try again. (400)";
            case 401:
                return "You must be logged in to access this resource. Please authenticate. (401)";
            case 403:
                return "You do not have the necessary permissions to perform this action. Contact an administrator if needed. (403)";
            case 404:
                return "The requested resource was not found. Check the URL or try again later. (404)";
            case 409:
                return "A conflict was detected with existing data. Please check your information and try again. (409)";
            case 422:
                return "Some provided data is invalid. Please correct the indicated fields and try again. (422)";
            case 429:
                return "You have made too many requests in a short time. Please wait before trying again. (429)";
            case 500:
                return "An internal server error occurred. Please try again later or contact support if the problem persists. (500)";
            case 502:
                return "The server received an invalid response. Please try again later. (502)";
            case 503:
                return "The service is temporarily unavailable. Please try again in a few moments. (503)";
            case 504:
                return "The timeout limit was reached. Please check your connection or try again later. (504)";
            case -1:
                return "An application error occurred. Please try again or contact support.";
            default:
                return `An unexpected error occurred. Please try again or contact support. (${status})`;
        }
    }

    static basicStringValidator(value: string, minLength?: number, maxLength?: number): string | null {
        const invalidCaracters = /[!@#$%^&*(),.?":{}|<>]/g;

        if (value.length < (minLength || 2) || (maxLength && value.length > maxLength)) {
            return `The text must contain between ${minLength || 2} and ${maxLength || "an infinite number of"} characters.`;
        } else if (invalidCaracters.test(value)) {
            return "The text must not contain special characters.";
        } else {
            return null;
        }
    }

    static passwordStringValidator(password: string): string | null {
        if (password.length < 8) return "The password must contain at least 8 characters.";
        return null;
    }

    static pathStringValidator(path: string): string | null {
        if (!path.startsWith("/") || path.length < 2 || path.includes(' ')) return "The path must start with '/' and contain no spaces.";
        return null;
    }

    static emailStringValidator(email: string): string | null {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "The email address is invalid.";
        return null;
    }

    static domainValidator(domain: string): string | null {
        const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;
        if (!domainRegex.test(domain)) return "The domain is invalid.";
        return null;
    }

    static emptyableDomainValidator(domain: string): string | null {
        if (domain === "") return null;
        const domainRegex = /^(?!-)(?:[a-zA-Z0-9-]{1,63}\.)+[a-zA-Z]{2,63}$/;
        if (!domainRegex.test(domain)) return "The domain is invalid.";
        return null;
    }

    static hexColorValidator(color: string): string | null {
        const hexColorRegex = /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/;
        if (!hexColorRegex.test(color)) return "The HEX color code is invalid.";
        return null;
    }

    static truncateString(str: string, num: number): string {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + '...';
    }

    static isInteger(value: string): boolean {
        // accepts +/- signs, digits only
        return /^[+-]?\d+$/.test(value.trim());
    }
}