import type { ListBlobResultBlob } from '@vercel/blob';

declare global {
    type timestamp = number;
    type componentType = 'header' | 'page' | 'footer' | 'component';
    
    interface ComponentNode {
        id: string;
        type: string;
        style?: Record<string, string>;
        attributes?: Record<string, string>;
        children?: ComponentNode[];
        props?: any;
        acceptChildren: boolean;
        [ key: string ]: any;
    };

    type Component = {
        type: 'header' | 'page' | 'footer' | 'component';
        name: string;
        lastEdited: timestamp;
        rootNode: ComponentNode;
    } & ({
        type: 'page'
        title: string;
        description: string;
    } | {
        type: 'header' | 'footer';
        displayCondition: [ displayCondition, ...displayCondition[] ];
    } | {
        type: 'component';
    });

    interface User {
        id: string;
        username: string;
        role: 'editor' | 'admin' | 'owner';
    };

    type displayCondition = {
        show: 'all';
        name?: string;
    } | {
        show: 'page';
        name: string;
    } | {
        show: 'exclude';
        name: string;
    };

    type editorVisibilityCondition = {
        key: string;
        value: string;
        and: editorVisibilityCondition;
        comparison?: 'equal' | 'different';
    } | {
        key: string;
        value: string;
        or: editorVisibilityCondition;
        comparison?: 'equal' | 'different';
    } | {
        key: string;
        value: string;
        comparison?: 'equal' | 'different';
    };

    type style = {
        type: 'string' | 'css-units' | 'shadow' | 'background' | 'color' | 'keyword' | 'font';
        default: string;
        condition?: editorVisibilityCondition;
        in: string;
    } & ({
        type: 'css-units';
        count?: number;
        units: string[];
    } | {
        type: 'string' | 'shadow' | 'background' | 'color' | 'keyword' | 'font';
    });

    type attribute = {
        type: 'string' | 'enum';
        default: any;
        condition?: editorVisibilityCondition;
        in: string;
    };

    type objectProperty = {
        type: 'string' | 'enum' | 'number' | 'object' | 'array';
        key: string;
    } & ({
        type: 'number' | 'string' | 'enum';
        default: any;
    } | {
        type: 'object';
        structure: objectProperty[];
    } | {
        type: 'array';
        structure: objectProperty;
    });

    type prop = {
        type: 'string' | 'number' | 'custom' | 'enum' | 'line' | 'code';
        default?: any;
        condition?: editorVisibilityCondition;
    } & ({
        type: 'string' | 'number' | 'enum' | 'line' | 'code';
    } | {
        type: 'custom';
        structure: objectProperty;
    });
    
    type BlobInformation = ListBlobResultBlob;

    interface NodeMetadata {
        props: Record<string, prop>;
        attributes: Record<string, attribute>;
        styles: Record<string, style>;

        enumerators: Record<string, { values: string[], icon?: boolean }>;

        acceptChildren: boolean;
    }
};

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        role?: string;
        name?: string;
    }
}

export {};