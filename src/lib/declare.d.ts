type timestamp = number;

declare global {
    interface PageNode {
        id: string;
        type: string;
        style?: Record<string, string>;
        attributes?: Record<string, string>;
        children?: PageNode[] | string;
        props?: any; // react component props
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
    } | {
        key: string;
        value: string;
        or: condition;
    } | {
        key: string;
        value: string;
    };

    type style = {
        type: 'string' | 'keyword';
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
        in: string
    };

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

    interface NodeMetadata {
        props: Record<string, prop>;
        attributes: Record<string, attribute>;
        styles: Record<string, style>;

        enumerators: Record<string, { values: string[], icon?: boolean }>;
    }
};

export {};