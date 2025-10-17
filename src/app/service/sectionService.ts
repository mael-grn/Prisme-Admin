import {InsertableSection, Section} from "@/app/models/Section";

export default class SectionService {

    /**
     * Get all sections for a given page id
     * @param pageId
     */
    static async getSectionsForPageId(pageId: number) : Promise<Section[]> {
        throw  new Error("Method not implemented.");
    }

    /**
     * Get all available section types
     */
    static async getSectionTypes() : Promise<SectionType[]> {
        throw  new Error("Method not implemented.");
    }

    /**
     * Get a section by its id
     * @param sectionId
     */
    static async getSectionById(sectionId: number) : Promise<Section>  {
        throw  new Error("Method not implemented.");
    }

    /**
     * Insert a new section and return the newly created section
     * @param newSection
     */
    static async insertSection(newSection : InsertableSection) : Promise<Section> {
        throw  new Error("Method not implemented.");
    }

    /**
     * Update a section and return the updated section
     * @param updatedSection
     */
    static async updateSection(updatedSection : Section) : Promise<Section> {
        throw  new Error("Method not implemented.");
    }


    /**
     * Move a section by its id and an offset
     * The offset can be positive or negative
     * If the offset is positive, the section will be moved down
     * If the offset is negative, the section will be moved up
     * @param id
     * @param offset
     */
    static async moveSection(id: number, offset: number) : Promise<void> {
        throw  new Error("Method not implemented.");
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


