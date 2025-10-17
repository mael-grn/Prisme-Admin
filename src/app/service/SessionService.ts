import axios, {AxiosError} from "axios";
import {StringUtil} from "@/app/utils/stringUtil";

export default class SessionService {
    static async createSession(email: string, password: string): Promise<void> {
        try {
            await axios.post('/api/sessions/', {email: email, password: password});
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    static async deleteSession(): Promise<void> {
        try {
            await axios.delete('/api/sessions/');
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }
}