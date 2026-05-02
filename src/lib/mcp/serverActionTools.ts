import z from 'zod';

import {
    userSchema,
    componentSchema,
    updateUserSchema,
    updateConfigSchema,
    componentTypesSchema
} from '@/lib/zodSchemas';
import { omit, resolveToPositionalArgs } from '@/lib/utils';

import * as blobs from '@/lib/actions/blob/internal';
import * as config from '@/lib/actions/config.internal';
import * as collections from '@/lib/actions/collections.internal';

import * as users from '@/lib/db/actions/user.internal';
import * as components from '@/lib/db/actions/component.internal';

import respond, { UNAUTHORIZED_ACTION } from './respond';

type serverActionModule = Record<string, {
    (...args: any[]): serverActionResponse<any>;
    auth?: 'weak' | 'strong';
}>;

const toolNamespaces: Record<string, serverActionModule> = {
    users,
    components: omit(components, 'getMatchingComponents'),
    config,
    collections,
    blobs: omit(blobs, 'getAdapter', 'getBlob')
};

const toolsInfo: Record<string, {
    title: string;
    description: string;
    args: {
        schema: z.ZodObject;
        positions: string[];
    };
}> = {
    //#region - User -
    getUser: {
        title: 'Get User',
        description:
            'Retrieves a user\'s information based off of their username.',
        args: {
            schema: z.object({
                username: z.string()
            }),
            positions: [ 'username' ]
        }
    },
    getAllUsers: {
        title: 'Get All Users',
        description:
            'Retrieves all users and their ID, username and role.',
        args: {
            schema: z.object({}),
            positions: []
        }
    },
    updateUser: {
        title: 'Update User',
        description:
            'Updates a user\'s information. ' +
            'The user that will be edited is decided by the ID. ' +
            'If a password is provided, it SHOULD NOT be hashed, as the tool will hash it itself. ' +
            'You must have a role with higher authority than the user you are trying to edit.',
        args: {
            schema: z.object({
                userState: updateUserSchema
            }),
            positions: [ 'userState' ]
        }
    },
    deleteUser: {
        title: 'Delete User',
        description:
            'Delete a user by the provided ID. ' +
            'You must have a role with higher authority than the user you are trying to delete.',
        args: {
            schema: z.object({
                id: z.string()
            }),
            positions: [ 'id' ]
        }
    },
    createUser: {
        title: 'Create User',
        description:
            'Create a new user based on the provided information. ' +
            'The tool returns the newly-created user\'s ID. ' +
            'The password SHOULD NOT be hashed, as the tool will hash it itself. ' +
            'You must have an "owner" role to create a new user.',
        args: {
            schema: z.object({
                userState: userSchema
            }),
            positions: [ 'userState' ]
        } 
    },
    //#endregion
    //#region - Component -
    getComponentByName: {
        title: 'Get Component By Name',
        description:
            'Fetches a page/ header/ footer/ component by name. ' +
            'If a type isn\'t provided, the tool defaults to searching pages.',
        args: {
            schema: z.object({
                name: z.string(),
                type: componentTypesSchema.optional()
            }),
            positions: [ 'name', 'type' ]
        }
    },
    getAllComponents: {
        title: 'Get All Components',
        description:
            'Fetches all pages/ headers/ footers/ components. ' +
            'If a type isn\'t provided, the tool defaults to searching pages.',
        args: {
            schema: z.object({
                type: componentTypesSchema.optional()
            }),
            positions: [ 'type' ]
        }
    },
    saveComponent: {
        title: 'Save Component',
        description:
            'Saves the page/ header/ footer/ component based off the provided name.',
        args: {
            schema: z.object({
                component: componentSchema
            }),
            positions: [ 'component' ]
        }
    },
    createComponent: {
        title: 'Create Component',
        description:
            'Create an empty page/ header/ footer/ component with a given name and type.',
        args: {
            schema: z.object({
                name: z.string(),
                type: componentTypesSchema.optional()
            }),
            positions: [ 'name', 'type' ]
        }
    },
    deleteComponent: {
        title: 'Delete Component',
        description:
            'Delete the page/ header/ footer/ component with a given name and/ or type.' +
            'If a type isn\'t provided, the tool defaults to deleting pages.',
        args: {
            schema: z.object({
                name: z.string(),
                type: componentTypesSchema.optional()
            }),
            positions: [ 'name', 'type' ]
        }
    },
    //#endregion  
    //#region - Config -
    getConfig: {
        title: 'Get Config',
        description: 'Retrieves the current configuration.',
        args: {
            schema: z.object({}),
            positions: []
        }
    },
    setConfig: {
        title: 'Set Config',
        description:
            'Updates the configuration. ' +
            'You must have an "admin" role to modify plugins or themes.',
        args: {
            schema: z.object({
                config: updateConfigSchema
            }),
            positions: [ 'config' ]
        }
    },
    //#endregion
    //#region - Collections -
    createCollection: {
        title: 'Create Collection',
        description:
            'Create a new collection in the plugins database with the specified name and privileges. ' +
            'You must have an "admin" role. ' +
            'NEVER use this tool unless the user directly instructs you to do so.',
        args: {
            schema: z.object({
                name: z.string(),
                privileges: z.array(z.enum([ 'read', 'add', 'update', 'delete' ]))
            }),
            positions: [ 'name', 'privileges' ]
        }
    },
    deleteCollection: {
        title: 'Delete Collection',
        description:
            'Delete a collection by name. ' +
            'You must have an "admin" role. ' +
            'NEVER use this tool unless the user directly instructs you to do so.',
        args: {
            schema: z.object({
                name: z.string()
            }),
            positions: [ 'name' ]
        }
    },
    readDocuments: {
        title: 'Read Documents',
        description:
            'Read documents from a collection. ' +
            'Optionally specify a range with "from" and "to" parameters. ' +
            'NEVER use this tool unless the user directly instructs you to do so.',
        args: {
            schema: z.object({
                collectionName: z.string(),
                from: z.number().optional(),
                to: z.number().optional()
            }),
            positions: [ 'collectionName', 'from', 'to' ]
        }
    },
    createDocument: {
        title: 'Create Document',
        description:
            'Create a new document in a collection. ' +
            'NEVER use this tool unless the user directly instructs you to do so.',
        args: {
            schema: z.object({
                collectionName: z.string(),
                document: z.any()
            }),
            positions: [ 'collectionName', 'document' ]
        }
    },
    updateDocument: {
        title: 'Update Document',
        description:
            'Update documents in a collection matching a condition. ' +
            'NEVER use this tool unless the user directly instructs you to do so.',
        args: {
            schema: z.object({
                collectionName: z.string(),
                document: z.any(),
                condition: z.any()
            }),
            positions: [ 'collectionName', 'document', 'condition' ]
        }
    },
    deleteDocument: {
        title: 'Delete Document',
        description:
            'Delete documents in a collection matching a condition. ' +
            'NEVER use this tool unless the user directly instructs you to do so.',
        args: {
            schema: z.object({
                collectionName: z.string(),
                condition: z.any()
            }),
            positions: [ 'collectionName', 'condition' ]
        }
    },
    //#endregion
    //#region - Blobs -
    getBlobList: {
        title: 'Get Blob List',
        description: 'Retrieve the list of all blobs.',
        args: {
            schema: z.object({}),
            positions: []
        }
    },
    addBlob: {
        title: 'Add Blob',
        description: 'Add a new blob to the storage with the given path and body. You can only send text files.',
        args: {
            schema: z.object({
                path: z.string(),
                body: z.string(),
                options: z.object({}).passthrough()
            }),
            positions: [ 'path', 'body', 'options' ]
        }
    },
    existsBlob: {
        title: 'Exists Blob',
        description: 'Check if a blob exists at the given pathname or if any blobs exist under a directory path.',
        args: {
            schema: z.object({
                path: z.string()
            }),
            positions: [ 'path' ]
        }
    },
    deleteBlob: {
        title: 'Delete Blob',
        description: 'Delete a blob or all blobs under a directory path.',
        args: {
            schema: z.object({
                path: z.string()
            }),
            positions: [ 'path' ]
        }
    }
    //#endregion  
};

const mcpServerActions = Object
    .values(toolNamespaces)
    .map(Object.entries)
    .flat()
    .map(([ key, value ]) => {
        const info = toolsInfo[ key ];
        const tool: mcpToolTuple = [
            key,
            { ...info, inputSchema: info.args.schema },
            async (args, extra) => {
                if (!extra.authInfo?.extra)
                    return UNAUTHORIZED_ACTION;

                for (const key of [ 'name', 'id', 'role' ])
                    if (!(key in extra.authInfo.extra))
                        return UNAUTHORIZED_ACTION;

                const positionalArgs = resolveToPositionalArgs(args, ...info.args.positions)
                
                const response =
                    'auth' in value
                    ?   value(extra.authInfo.extra!, ...positionalArgs)
                    :   value(...positionalArgs);

                return respond(await response);
            }
        ];

        return tool;
    });

export default mcpServerActions;