export class UserNotFoundError extends Error {
    constructor(message: string = "Utilisateur non trouvé") {
        super(message);
        this.name = "UserNotFoundError";
    }
}