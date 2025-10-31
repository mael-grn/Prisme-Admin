import {InsertablePage, Page, RecursivePage} from "@/app/models/Page";
import axios, {AxiosError} from "axios";
import {DisplayWebsite} from "@/app/models/DisplayWebsite";
import {StringUtil} from "@/app/utils/stringUtil";

export default class PageService {

    /**
     * Get all pages for the current logged in user
     */
    static async getMyPagesFromWebsite( websiteId : number) : Promise<Page[]> {
        try {
            const response = await axios.get(`/api/websites/${websiteId}/pages`);
            return response.data.data as Page[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async getMyRecursivePagesFromWebsite(websiteId : number) : Promise<RecursivePage[]> {
        try {
            const response = await axios.get(`/api/websites/${websiteId}/pages?recursive=true`);
            return response.data.data as RecursivePage[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Get a page by its id
     * @param pageId
     */
    static async getPageById(pageId: number) : Promise<Page>  {
        try {
            const response = await axios.get(`/api/pages/${pageId}`);
            return response.data.data as Page;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async getRecursivePageById(pageId: number) : Promise<RecursivePage>  {
        try {
            const response = await axios.get(`/api/pages/${pageId}?recursive=true`);
            return response.data.data as RecursivePage;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Insert a new page and return the newly created page
     * @param newPage
     */
    static async insertPage(newPage: InsertablePage) : Promise<Page> {
        try {
            const response = await axios.post(`/api/websites/${newPage.website_id}/pages`, newPage);
            return response.data.data as Page;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Update an existing page and return the updated page
     * @param updatedPage
     */
    static async updatePage(updatedPage: Page) : Promise<Page> {
        try {
            const response = await axios.put(`/api/pages/${updatedPage.id}`, updatedPage);
            return response.data.data as Page;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Delete a page and return the number of deleted rows
     * @param page
     */
    static async deletePage(page: Page) : Promise<void> {
        try {
            await axios.delete(`/api/pages/${page.id}`);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async movePage(pageWithNewPos: Page) : Promise<void> {
        try {
            await axios.post(`/api/pages/${pageWithNewPos.id}/move_position`, pageWithNewPos);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }
}


