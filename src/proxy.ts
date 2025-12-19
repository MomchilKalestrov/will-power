import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

const next = (request: NextRequest): NextResponse => {
    const headers = new Headers(request.headers);
    headers.set('x-current-path', request.nextUrl.pathname);
    return NextResponse.next({
        request: { headers },
    });
};

const authenticate = async (request: NextRequest): Promise<NextResponse> => {
    const token = await getToken({ req: request });
    if (token) return next(request);

    const params = request.nextUrl.searchParams;
    params.set('callbackUrl', request.url);

    return NextResponse.redirect(new URL(
        '/admin/auth/login?' + params.toString(),
        request.url
    ));
};

export const proxy = (request: NextRequest): NextResponse | Promise<NextResponse> => {
    const { pathname } = request.nextUrl;
    if (/^\/admin(?!\/auth)/.test(pathname))
        return authenticate(request);
    return next(request);
};

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ]
};