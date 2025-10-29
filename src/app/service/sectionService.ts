import {InsertableSection, Section} from "@/app/models/Section";
import axios, {AxiosError} from "axios";
import {Page} from "@/app/models/Page";
import {StringUtil} from "@/app/utils/stringUtil";

export default class SectionService {

    /**
     * Get all sections for a given page id
     * @param pageId
     */
    static async getSectionsForPageId(pageId: number) : Promise<Section[]> {
        try {
            const response = await axios.get(`/api/pages/${pageId}/sections`);
            return response.data.data as Section[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Get all available section types
     */
    static getSectionTypes() : string[] {
        return [
            "classic",
            "develop",
            "tile"
        ]
    }

    /**
     * Get a section by its id
     * @param sectionId
     */
    static async getSectionById(sectionId: number) : Promise<Section>  {
        try {
            const response = await axios.get(`/api/sections/${sectionId}`);
            return response.data.data as Section;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Insert a new section and return the newly created section
     * @param newSection
     */
    static async insertSection(newSection : InsertableSection) : Promise<void> {
        try {
            await axios.post(`/api/pages/${newSection.page_id}/sections`, newSection);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Update a section and return the updated section
     * @param updatedSection
     */
    static async updateSection(updatedSection : Section) : Promise<void> {
        try {
            await axios.put(`/api/sections/${updatedSection.page_id}`, updatedSection);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }


    /**
     * Move a section whose position has changed, update other sections positions accordingly
     */
    static async moveSection(section: Section ) : Promise<void> {
        try {
            await axios.post(`/api/sections/${section.id}/move_position`, section);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Delete a section
     * Deletes all descendant elements
     * Normalizes the position of other sections
     * return the number of deleted sections (1 or 0)
     * @param section
     */
    static async deleteSection(section: Section) : Promise<number> {
        //TODO supprimer tous les elements descendant
        //TODO normaliser la position des autres sections
        throw  new Error("Method not implemented.");
    }
}


