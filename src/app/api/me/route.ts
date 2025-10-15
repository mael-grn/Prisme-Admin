import {getConnectedUser} from "@/app/utils/apiUtil";
import {NextResponse} from "next/server";
import {InsertableUser} from "@/app/models/User";
import {neon} from "@neondatabase/serverless";
import {hashPassword} from "@/app/utils/passwordUtil";

export async function GET() {
    const user = await getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }
    return NextResponse.json((user), {status: 200});
}

/**
 * Update the connected user profile
 * @param request
 * @constructor
 */
export async function PUT(request: Request) {
    const user = await getConnectedUser();
    if (!user) {
        return NextResponse.json({message: "User not found"}, {status: 404});
    }
    const data: InsertableUser = await request.json();

    const sql = neon(`${process.env.DATABASE_URL}`);
    const hashedPassword = hashPassword(data.password);

    await sql`UPDATE users SET 
                 username = ${data.username},
        first_name = ${data.first_name},
        last_name = ${data.last_name},
        is_public = ${data.is_public},
        password = ${hashedPassword}
             WHERE id = ${user.id}`;

    return NextResponse.json({message: "Profile updated successfully"}, {status: 200});
}