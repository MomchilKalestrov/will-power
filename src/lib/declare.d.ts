
declare global {
    type timestamp = number;
    
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
        type: 'string' | 'css-units' | 'shadow' | 'background' | 'keyword';
        default: string;
        condition?: condition;
        in: string;
    } & ({
        type: 'css-units';
        count?: number;
        units: string[];
    } | {
        type: 'string' | 'shadow' | 'background' | 'keyword';
    });

    type attribute = {
        type: 'string' | 'enum';
        default: any;
        condition?: condition;
        in: string;
    };

    type propStructure = {
        type: 'string' | 'enum' | 'number' | 'object' | 'array';
        key: string;
    } & ({
        type: 'number' | 'string' | 'enum';
    } | {
        type: 'object';
        structure: propStructure[];
    } | {
        type: 'array';
        structure: Omit<propStructure, 'key'>[];
    });

    type prop = {
        type: 'string' | 'number' | 'custom' | 'enum';
        default: any;
        condition?: condition;
    } & ({
        type: 'string' | 'number' | 'enum';
    } | {
        type: 'custom';
        structure: propStructure;
    });
    
    type BlobInformation = ListBlobResultBlob;

    interface NodeMetadata {
        props: Record<string, prop>;
        attributes: Record<string, attribute>;
        styles: Record<string, style>;

        enumerators: Record<string, { values: string[], icon?: boolean }>;
    }
};

export {};