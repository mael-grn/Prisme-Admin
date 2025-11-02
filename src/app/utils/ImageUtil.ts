import {put} from "@vercel/blob";

export class ImageUtil {
    static async uploadImage(file: File): Promise<string> {
        if (!file) {
            throw "No file provided";
        }
        const token = process.env.NEXT_PUBLIC_BLOB_READ_WRITE_TOKEN;
        try {
            const blobRes = await put(file.name, file, {
                access: 'public',
                token: token,
            });
            return blobRes.url;
        } catch (error) {
            throw (error as Error).message;
        }
    }
}