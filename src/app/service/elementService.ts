import {ElementType, InsertableElement} from "@/app/models/Element";

export default class ElementService {

    /**
     * Récupère tous les types de d'element possible
     */
    static async getTypes() : Promise<ElementType[]> {
        throw new Error("Function not implemented.");
    }

    /**
     * Recupere un type d'element par son id
     * @param id
     */
    static async getTypeById(id: number) : Promise<ElementType | null> {
        throw new Error("Function not implemented.");
    }

    /**
     * Récupère tous les éléments dont la section correspond à l'id passé en paramètre
     * @param sectionId
     */
    static async getElementsFromSectionId(sectionId: number) : Promise<Element[]> {
        throw new Error("Function not implemented.");
    }

    /**
     * Récupère un élément par son id. Ne peut pas récupérer un élément n'appartenant pas à l'utilisateur connecté
     * @param elementId
     */
    static async getElementById(elementId: number) : Promise<Element>  {
        throw new Error("Function not implemented.");
    }

    /**
     * Insère un nouvel élément dans la base de données.
     * Retourne l'élément inséré avec son id.
     * @param newElement
     */
    static async insertElement(newElement : InsertableElement) : Promise<Element> {
        throw new Error("Function not implemented.");
    }

    /**
     * Met à jour le contenu d'un élément.
     * Se base sur l'id de l'élément passé en paramètre.
     * Ne change pas la position.
     * @param updatedElement
     */
    static async updateElement(updatedElement: Element) : Promise<Element> {
        throw new Error("Function not implemented.");
    }

    /**
     * Déplace un élément dans une section en modifiant sa position.
     * Le paramètre offset peut être positif ou négatif.
     * Si l'offset est positif, l'élément sera déplacé vers le bas.
     * Si l'offset est négatif, l'élément sera déplacé vers le haut.
     * Ne fait rien si l'élément n'existe pas ou si l''offset est nul.
     * Ne fait rien si l'élément ne peut pas être déplacé (déplacement hors des limites de la section).
     * Modifie egalement la position des autres elements pour que les positions restent cohérentes.
     * @param id
     * @param offset
     */
    static async moveElement(id: number, offset: number) : Promise<void> {
        throw new Error("Function not implemented.");
    }


    /**
     * Supprime un élément et ses fichiers associés
     * Retourne le nombre d'éléments supprimés (0 ou 1)
     * @param element
     */
    static async deleteElement(element: Element) : Promise<number> {

        //TODO Normaliser la position des autres éléments de la section
        //TODO Supprimer les fichiers associés à l'élément s'il y en a
        throw new Error("Function not implemented.");
    }
}
