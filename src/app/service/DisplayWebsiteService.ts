import {DisplayWebsite, InsertableDisplayWebsite, RecursiveWebsite} from "@/app/models/DisplayWebsite";
import axios, {AxiosError} from "axios";
import {StringUtil} from "@/app/utils/stringUtil";

export default class DisplayWebsiteService {

    static async createNewWebsite(newWebsite: InsertableDisplayWebsite) {
        try {
            const response = await axios.post('/api/me/websites', newWebsite);
            return response.data.data as DisplayWebsite;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async getMyWebsites(): Promise<DisplayWebsite[]> {
        try {
            const response = await axios.get('/api/me/websites');
            return response.data.data as DisplayWebsite[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async deleteWebsite(websiteId: number): Promise<void> {
        try {
            await axios.delete(`/api/websites/${websiteId}`);
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async updateWebsite(editedWebsite: DisplayWebsite) {
        try {
            const response = await axios.put(`/api/websites/${editedWebsite.id}`, editedWebsite);
            return response.data.data as DisplayWebsite;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async getWebsiteById(websiteId: number): Promise<DisplayWebsite> {
        try {
            const response = await axios.get(`/api/websites/${websiteId}`);
            return response.data.data as DisplayWebsite;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async getRecursiveWebsiteById(websiteId: number): Promise<RecursiveWebsite> {
        try {
            const response = await axios.get(`/api/websites/${websiteId}?recursive=true`);
            return response.data.data as RecursiveWebsite;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }
}