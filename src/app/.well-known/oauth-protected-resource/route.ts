import {
    protectedResourceHandler,
    metadataCorsOptionsRequestHandler,
} from 'mcp-handler';

const handler = protectedResourceHandler({
    authServerUrls: [ process.env.NEXTAUTH_URL ]
});

const corsHandler = metadataCorsOptionsRequestHandler();

export { handler as GET, corsHandler as OPTIONS };