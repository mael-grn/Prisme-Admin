import {InsertableUser, User} from "@/app/models/User";
import axios, {AxiosError} from "axios";
import {StringUtil} from "@/app/utils/stringUtil";

export default class UserService {

    /**
     * Get the current logged in user
     */
    static async getMyUser() : Promise<User> {
        try {
            const response = await axios.get('/api/me/', {withCredentials: true});
            return response.data as User;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Update the current logged in user
     */
    static async updateMyUser(updatedUser : InsertableUser) : Promise<User> {
        try {
            const response = await axios.put('/api/me/', updatedUser, {withCredentials: true});
            return response.data as User;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }

    /**
     * Insert a new user and return the newly created user
     */
    static async insertUser(newUser : InsertableUser) : Promise<User> {
        try {
            const response = await axios.post('/api/users/', newUser);
            return response.data as User;
        } catch (e) {
            throw StringUtil.getErrorMessageFromStatus((e as AxiosError).status || -1)
        }
    }
}