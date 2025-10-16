export default class SessionService {
    static async createSession(email: string, password: string): Promise<string | null> {
        throw new Error("Method not implemented.");
    }

    static async deleteSession(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
}