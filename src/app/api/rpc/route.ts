import z from 'zod';
import { type NextRequest, NextResponse } from 'next/server';

import * as config from '@/lib/actions/config';
import * as collections from '@/lib/actions/collections';

import * as users from '@/lib/db/actions/user';
import * as components from '@/lib/db/actions/component';

const jsonRPCSchema = z.object({
    jsonrpc: z.literal('2.0'),
    method: z.string().includes('.'),
    id: z.union([ z.number(), z.string() ]),
    params: z.array(z.any())
});

const methods = {
    users,
    components,
    config,
    collections
} as any as Record<string, Record<string, (...params: any[]) => serverActionResponse<any>>>;

const respond = (data: any, status: number) =>
    new NextResponse(JSON.stringify(data), { status });

const POST = async (request: NextRequest) => {
    let rpcCall: z.infer<typeof jsonRPCSchema>;
    
    try {
        const json = await request.json();
        rpcCall = jsonRPCSchema.parse(json);
    } catch (e) {
        return respond({
            jsonrpc: '2.0',
            error: {
                code: -32600,
                message: 'Invalid Request'
            }
        }, 400);
    };

    const [ namespaceName, methodName ] = rpcCall.method.split('.');

    const namespace = methods[ namespaceName ];
    if (!namespace)
        return respond({
            jsonrpc: '2.0',
            error: {
                code: -32601,
                message: 'Method not found'
            },
            id: rpcCall.id
        }, 400);

    const method = namespace[ methodName ];
    if (!method)
        return respond({
            jsonrpc: '2.0',
            error: {
                code: -32601,
                message: 'Method not found'
            },
            id: rpcCall.id
        }, 400);
    
    const response = await method(...rpcCall.params);

    if (response.success)
        return respond({
            jsonrpc: '2.0',
            result: response.value,
            id: rpcCall.id
        }, 200);
    else if (response.reason.includes('Server error'))
        return respond({
            jsonrpc: '2.0',
            error: {
                code: -32000,
                message: 'Server error'
            },
            id: rpcCall.id
        }, 500);
    else
        return respond({
            jsonrpc: '2.0',
            error: {
                code: -32602,
                message: 'Invalid params'
            },
            id: rpcCall.id
        }, 500);
};

export { POST };