
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

    interface Component {
        type: componentType;
        name: string;
        lastEdited: timestamp;
        rootNode: ComponentNode;
        displayCondition?: [ displayCondition, ...displayCondition[] ];
    }

    interface User {
        id: string;
        username: string;
        role: 'editor' | 'admin';
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
        type: 'string' | 'css-units' | 'shadow' | 'background' | 'color' | 'keyword';
        default: string;
        condition?: editorVisibilityCondition;
        in: string;
    } & ({
        type: 'css-units';
        count?: number;
        units: string[];
    } | {
        type: 'string' | 'shadow' | 'background' | 'color' | 'keyword';
    });

    type attribute = {
        type: 'string' | 'enum';
        default: any;
        condition?: editorVisibilityCondition;
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
        condition?: editorVisibilityCondition;
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

        acceptChildren: boolean;
    }
};

export {};