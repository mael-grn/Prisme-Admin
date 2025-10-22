export class InvalidParamsError extends Error {
    constructor(message: string = "Paramètre de la requête invalide") {
        super(message);
        this.name = "InvalidParamsError";
    }
}