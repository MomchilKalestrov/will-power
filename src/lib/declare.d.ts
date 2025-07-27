type timestamp = number;

declare global {
    interface PageNode {
        id: string;
        type: string;
        style?: Record<string, string>;
        attributes?: Record<string, string>;
        children?: PageNode[];
        props?: any; // react component props
        acceptChildren: boolean;
        [ key: string ]: any;
    };

    interface Page {
        name: string;
        lastEdited: timestamp;
        rootNode: PageNode;
    }

    interface User {
        id: string;
        name: string;
        role: 'user' | 'editor' | 'admin';
    };

    type condition = {
        key: string;
        value: string;
        and: condition;
        comparison?: 'equal' | 'different';
    } | {
        key: string;
        value: string;
        or: condition;
        comparison?: 'equal' | 'different';
    } | {
        key: string;
        value: string;
        comparison?: 'equal' | 'different';
    };

    type style = {
        type: 'string';
        default: string;
        count?: number;
        condition?: condition;
        in: string;
    } | {
        type: 'css-units';
        default: string;
        count?: number;
        units: string[];
        condition?: condition;
        in: string;
    } | {
        type: 'shadow' | 'background' | 'keyword';
        default: string;
        condition?: condition;
        in: string;
    }

    type attribute = {
        type: 'string' | 'enum';
        default: any;
        condition?: condition;
        in: string;
    };

    type prop = {
        type: 'string' | 'number' | 'object' | 'enum';
        optional?: boolean;
        default: any;
        condition?: condition;
        in: string;
    };
    
    type BlobInformation = ListBlobResultBlob;

    interface NodeMetadata {
        props: Record<string, prop>;
        attributes: Record<string, attribute>;
        styles: Record<string, style>;

        enumerators: Record<string, { values: string[], icon?: boolean }>;
    }
};

export {};