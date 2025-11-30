import {InsertableElement} from "@/app/models/Element";
import axios, {AxiosError} from "axios";
import {StringUtil} from "@/app/utils/stringUtil";
import {Element} from "@/app/models/Element";
export default class ElementService {

    /**
     * Récupère tous les éléments dont la section correspond à l'id passé en paramètre
     * @param sectionId
     */
    static async getElementsFromSectionId(sectionId: number) : Promise<Element[]> {
        try {
            const response = await axios.get(`/api/sections/${sectionId}/elements`);
            return response.data.data as Element[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static getElementTypes() : string[] {
        return [
            "title",
            "text",
            "link",
            "image"
        ]
    }

    /**
     * Récupère un élément par son id. Ne peut pas récupérer un élément n'appartenant pas à l'utilisateur connecté
     * @param elementId
     */
    static async getElementById(elementId: number) : Promise<Element>  {
        try {
            const response = await axios.get(`/api/elements/${elementId}`);
            return response.data.data as Element;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Insère un nouvel élément dans la base de données.
     * Retourne l'élément inséré avec son id.
     * @param newElement
     */
    static async insertElement(newElement : InsertableElement) : Promise<void> {
        try {
            await axios.post(`/api/sections/${newElement.section_id}/elements`, newElement);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Met à jour le contenu d'un élément.
     * Se base sur l'id de l'élément passé en paramètre.
     * Ne change pas la position.
     * @param updatedElement
     */
    static async updateElement(updatedElement: Element) : Promise<void> {
        try {
            await axios.put(`/api/elements/${updatedElement.id}`, updatedElement);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Déplace un élément dans une section en modifiant sa position.
     * Le paramètre offset peut être positif ou négatif.
     * Si l'offset est positif, l'élément sera déplacé vers le bas.
     * Si l'offset est négatif, l'élément sera déplacé vers le haut.
     * Ne fait rien si l'élément n'existe pas ou si l''offset est nul.
     * Ne fait rien si l'élément ne peut pas être déplacé (déplacement hors des limites de la section).
     * Modifie egalement la position des autres elements pour que les positions restent cohérentes.
     */
    static async moveElement(element: Element) : Promise<void> {
        try {
            await axios.post(`/api/elements/${element.id}/move_position`, element);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }


    /**
     * Supprime un élément et ses fichiers associés
     * Retourne le nombre d'éléments supprimés (0 ou 1)
     * @param element
     */
    static async deleteElement(element: Element) : Promise<void> {

        try {
            await axios.delete(`/api/elements/${element.id}`);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }
}
