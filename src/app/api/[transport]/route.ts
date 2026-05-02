import * as mcp from 'mcp-handler';
import { decode } from 'next-auth/jwt';
import type { AuthInfo } from '@modelcontextprotocol/sdk/server/auth/types.js';

import mcpElementTools from '@/lib/mcp/elementTools';
import mcpServerActionTools from '@/lib/mcp/serverActionTools';

const handler = mcp.createMcpHandler(server => {
    mcpElementTools.forEach(tool => server.registerTool(...tool));
    mcpServerActionTools.forEach(tool => server.registerTool(...tool));
}, {}, {
    basePath: '/api',
    maxDuration: 60,
    verboseLogs: true
});

const verifyToken = async (_: Request, bearer?: string): Promise<AuthInfo | undefined> => {
    if (!bearer) return;

    const token = await decode({
        token: bearer,
        secret: process.env.NEXTAUTH_SECRET
    });

    if (!token) return;

    return {
        token: bearer,
        clientId: token.name ?? 'unknown',
        scopes: [],
        extra: {
            id: token.id,
            name: token.name,
            role: token.role
        }
    };
}

const authHandler = mcp.withMcpAuth(handler, verifyToken, { required: true });

export { authHandler as GET, authHandler as POST };