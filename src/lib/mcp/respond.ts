import type z from 'zod';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types';

type CallToolResult = z.infer<typeof CallToolResultSchema>;

const respond = (res: Awaited<serverActionResponse<any>>): CallToolResult => ({
    content: [ {
        type: 'text',
        text: JSON.stringify(res, null, '\t')
    } ]
});

const UNAUTHORIZED_ACTION = respond({ success: false, reason: 'Unauthorized action.' });

export { UNAUTHORIZED_ACTION, type CallToolResult };
export default respond;