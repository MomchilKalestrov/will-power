import { NextResponse } from 'next/server';

import info from '../oauthInfo';

export const GET = () =>
    NextResponse.json(info, {
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    });