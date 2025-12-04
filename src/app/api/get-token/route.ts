import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const GET = async () => {
    const cookie = await cookies();
    return new NextResponse(cookie.get('next-auth.session-token')?.value);
};

export { GET };