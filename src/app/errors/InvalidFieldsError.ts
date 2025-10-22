export class InvalidFieldsError extends Error {
    constructor(message: string = "Certains champs sont invalides ou manquants") {
        super(message);
        this.name = "InvalidFieldsError";
    }
}