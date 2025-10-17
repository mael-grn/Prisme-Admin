
import { jwtVerify, SignJWT, JWTPayload } from 'jose';

export class TokenUtil {

    static secret = process.env.JWT_SECRET!;

    /**
     * Créer un token JWT à partir d'un id
     * @param id
     */
    static async createTokenFromId(id: number): Promise<string> {
        const encoder = new TextEncoder();
        return await new SignJWT({id: id} as unknown as JWTPayload)
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('1y')
            .sign(encoder.encode(TokenUtil.secret));
    }

    /**
     * Vérifie la validité d'un token JWT en retournant un booléen
     * @param token
     */
    static async verifyToken(token: string): Promise<boolean> {
        try {
            const encoder = new TextEncoder();
            await jwtVerify(token, encoder.encode(TokenUtil.secret));
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Retourne l'id correspondant à un token JWT
     * Retourne null si le token n'est pas valide
     * @param token
     */
    static async getIdFromToken(token: string): Promise<number | null> {
        try {
            const encoder = new TextEncoder();
            const { payload } = await jwtVerify(token, encoder.encode(TokenUtil.secret));
            return payload.id as unknown as number;
        } catch {
            return null;
        }

    }
}