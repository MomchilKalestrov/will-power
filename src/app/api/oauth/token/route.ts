import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

import { encode } from 'next-auth/jwt';

import { authCodeStore, refreshTokenStore } from '@/lib/oauth/store';

export const POST = async (req: NextRequest) => {
    const body       = await req.formData();
    const grant_type = body.get('grant_type');

    switch (grant_type) {
        case 'authorization_code': return handleAuthCode(body);
        case 'refresh_token': return handleRefresh(body);
        default: return NextResponse.json({ error: 'unsupported_grant_type' }, { status: 400 });
    };
};

const handleAuthCode = async (body: FormData) => {
    const code          = body.get('code');
    const redirect_uri  = body.get('redirect_uri');
    const client_id     = body.get('client_id');
    const code_verifier = body.get('code_verifier');

    if (typeof code !== 'string')
        return NextResponse.json(
            { error: 'unsupported_code_type' },
            { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (!client_id)
        return NextResponse.json(
            { error: 'client_id is required' },
            { status: 401, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (typeof code_verifier !== 'string') {
        return NextResponse.json(
            { error: 'invalid_request', detail: 'code_verifier is required' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    }

    const stored = authCodeStore.get(code);

    if (!stored)
        return NextResponse.json(
            { error: 'invalid_grant', detail: 'unknown code' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (Date.now() > stored.expiresAt) {
        authCodeStore.delete(code);
        return NextResponse.json(
            { error: 'invalid_grant', detail: 'code expired' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    };

    //if (stored.redirectUri !== redirect_uri || stored.clientId !== client_id)
    //    return NextResponse.json(
    //        { error: 'invalid_grant', detail: 'redirect_uri mismatch' },
    //        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
    //    );
    
    const expectedChallenge = createHash('sha256')
        .update(code_verifier)
        .digest('base64url');

    if (expectedChallenge !== stored.codeChallenge)
        return NextResponse.json(
            { error: 'invalid_grant', detail: 'code_verifier mismatch' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    authCodeStore.delete(code);

    const accessToken  = await mintAccessToken(stored);
    const refreshToken = mintRefreshToken(stored);

    return NextResponse.json({
        token_type:    'Bearer',
        access_token:  accessToken,
        expires_in:    3600,
        refresh_token: refreshToken,
        scope:         'read write',
    }, { headers: { 'Access-Control-Allow-Origin': '*' } });
};

async function handleRefresh(body: FormData) {
    const refresh_token = body.get('refresh_token');
    const client_id     = body.get('client_id');

    if (!client_id)
        return NextResponse.json({ error: 'unauthorized_client' }, { status: 401 });

    if (typeof refresh_token !== 'string')
        return NextResponse.json(
            { error: 'invalid_grant', detail: 'invalid refresh token' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    const stored = refreshTokenStore.get(refresh_token);

    if (!stored)
        return NextResponse.json(
            { error: 'invalid_grant', detail: 'unknown refresh token' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );

    if (Date.now() > stored.expiresAt) {
        refreshTokenStore.delete(refresh_token);
        return NextResponse.json(
            { error: 'invalid_grant', detail: 'refresh token expired' },
            { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } }
        );
    };

    refreshTokenStore.delete(refresh_token);

    const accessToken     = await mintAccessToken(stored);
    const newRefreshToken = mintRefreshToken(stored);

    return NextResponse.json({
        token_type:    'Bearer',
        access_token:  accessToken,
        expires_in:    3600,
        refresh_token: newRefreshToken
    });
};

const mintAccessToken = ({ id, username, role }: User) =>
    encode({
        token: {
            sub:  id,
            id,
            name: username,
            username,
            role,
            iat:  Math.floor(Date.now() / 1000),
            exp:  Math.floor(Date.now() / 1000) + 3600,
        },
        secret: process.env.NEXTAUTH_SECRET!,
        maxAge: 3600,
    });

const mintRefreshToken = ({ id, username, role }: User) => {
    const { randomBytes } = require('crypto');
    const token = randomBytes(40).toString('hex');

    refreshTokenStore.set(token, {
        id,
        username,
        role,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
    });

    return token;
};