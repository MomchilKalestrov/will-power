import { NextRequest, NextResponse } from 'next/server';

const bodyToObject = async (request: NextRequest): Promise<any> => {
    const clone = request.clone();
    switch (clone.headers.get('content-type')) {
        case 'application/x-www-form-urlencoded':
            return Object.fromEntries([ ...new URLSearchParams(await clone.text()) ]);
        default: 
            return await request.json();
    };
};

const handler = async (request: NextRequest) => {
    const body = await bodyToObject(request);
    return NextResponse.json({
      access_token: body.code,
      token_type: 'Bearer',
      expires_in: 3600,
    });
};

export { handler as GET, handler as POST };