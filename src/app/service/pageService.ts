import {InsertablePage, Page} from "@/app/models/page";

export default class PageService {

    /**
     * Get all pages for the current logged in user
     */
    static async getMyPages() : Promise<Page[]> {
        throw new Error("Function not implemented.");
    }

    /**
     * Get a page by its id
     * @param pageId
     */
    static async getPageById(pageId: number) : Promise<Page>  {
        throw new Error("Function not implemented.");
    }

    /**
     * Insert a new page and return the newly created page
     * @param newPage
     */
    static async insertPage(newPage: InsertablePage) : Promise<Page> {
        throw new Error("Function not implemented.");
    }

    /**
     * Update an existing page and return the updated page
     * @param updatedPage
     */
    static async updatePage(updatedPage: Page) : Promise<Page> {
        throw new Error("Function not implemented.");
    }

    /**
     * Delete a page and return the number of deleted rows
     * @param page
     */
    static async deletePage(page: Page) : Promise<number> {
        throw new Error("Function not implemented.");
    }
}


