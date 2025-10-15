import {InsertableUser, User} from "@/app/models/User";

export default class UserService {

    /**
     * Get the current logged in user
     */
    static async getMyUser() : Promise<User> {
        throw new Error("Method not implemented.");
    }

    /**
     * Update the current logged in user
     */
    static async updateMyUser(updatedUser : User) : Promise<User> {
        throw new Error("Method not implemented.");
    }

    /**
     * Insert a new user and return the newly created user
     */
    static async insertUser(newUser : InsertableUser) : Promise<User> {
        throw new Error("Method not implemented.");
    }
}