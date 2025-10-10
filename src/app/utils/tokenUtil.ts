import { jwtVerify, SignJWT, JWTPayload } from 'jose';

const SECRET = process.env.JWT_SECRET!;

export async function createTokenFromId(id: number): Promise<string> {
    const encoder = new TextEncoder();
    return await new SignJWT({id: id} as unknown as JWTPayload)
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('1y')
        .sign(encoder.encode(SECRET));
}

export async function verifyToken(token: string): Promise<boolean> {
    try {
        const encoder = new TextEncoder();
        await jwtVerify(token, encoder.encode(SECRET));
        return true;
    } catch {
        return false;
    }
}

export async function getIdFromToken(token: string): Promise<number> {
    console.log('getIdFromToken: Vérification du token', token);
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(SECRET));
    return payload.id as unknown as number;
}