import { z } from 'zod';
import argon2 from 'argon2';
import { encode, decode } from 'next-auth/jwt';
import { createMcpHandler } from 'mcp-handler';
import { NextRequest, NextResponse } from 'next/server';

import connect from '@/lib/db';
import { componentSchema } from '@/lib/zodSchemas';

import User from '@/models/user';

type DbUser = User & { passwordHash: string, _id: object };

const mcp = createMcpHandler(
    async server => {
        server.registerTool(
            'authenticate',
            {
                inputSchema: z.object({ username: z.string(), password: z.string() }),
                outputSchema: z.string()
            },
            async ({ username, password }) => {
                try {
                    await connect();
                    
                    const user = await User.findOne({ username }).lean<DbUser>();
                    if (!user || !(await argon2.verify(user.passwordHash!, password)))
                        return {
                            content: [ {
                                type: 'text',
                                text: 'Invalid credentials.'
                            } ]
                        };

                    const token = await encode({
                        secret: process.env.NEXTAUTH_SECRET!,
                        token: {
                            id: user._id.toString(),
                            name: user.username,
                            role: user.role
                        }
                    });

                    return {
                        content: [ {
                            type: "text",
                            text: token
                        } ]
                    };
                } catch (error) {
                    console.error('[auth] Error signing in: ' + error);
                    return {
                        content: [ {
                            type: "text",
                            text: 'Error during authentication.',
                        } ]
                    };
                };
            }
        );
        server.registerTool(
            'updateComponent',
            {
                inputSchema: z.object({ component: componentSchema }),
                outputSchema: z.object({ success: z.boolean() })
            },
            async ({ component }) => {


                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify({ success: true }),
                        },
                    ]
                };
            }
        )
    },
    {
        capabilities: {
            tools: {
            },
        },
    },
    {
        basePath: "",
        verboseLogs: true,
        maxDuration: 60,
        disableSse: true,
    },
);

const unauthenticatedMethods = [ 'getComponent', 'listComponents', 'authenticate' ];
const needsAuthentication = async (request: NextRequest): Promise<boolean> => {
    const clone = request.clone();
    const json = await clone.json();
    return !unauthenticatedMethods.includes(json.method);
}

const handler = async (request: NextRequest): Promise<Response> => {
    if (!await needsAuthentication(request))
        return mcp(request);
    
    const token = request.headers.get('Authorization')?.split(' ')[ 1 ];
    try {
        var session = await decode({ token: token || '', secret: process.env.NEXTAUTH_SECRET! });
    } catch (error) {
        console.error('[mpc] Error decoding token: ', error);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return await mcp(request);
};

export { handler as GET, handler as POST, handler as DELETE };