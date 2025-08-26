import { type NextRequest, NextResponse } from "next/server";

const getTheme = () => '';

const GET = () =>
    new NextResponse(getTheme(), {
        headers: {
            'Content-Type': 'text/css'
        }
    });

export { GET };