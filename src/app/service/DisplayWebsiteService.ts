import {DisplayWebsite, InsertableDisplayWebsite} from "@/app/models/DisplayWebsite";
import axios, {AxiosError} from "axios";
import StringUtil from "@/app/utils/stringUtil";

export default class DisplayWebsiteService {

    static async createNewWebsite(newWebsite: InsertableDisplayWebsite) {
        try {
            const response = await axios.post('/api/me/websites', newWebsite);
            return response.data as DisplayWebsite;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async getMyWebsites(): Promise<DisplayWebsite[]> {
        try {
            const response = await axios.get('/api/me/websites');
            return response.data as DisplayWebsite[];
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }
}