'use client';
import React from 'react';

type FlatTreeNode = {
    id: string;
    children: string[];
};
type FlatComponentTree = Record<string, FlatTreeNode>;

const treeToFlat = (tree: ComponentNode): FlatComponentTree => {
    let flatTree: FlatComponentTree = {};

    const iterateNode = (node: ComponentNode) => {
        flatTree[ node.id ] = { ...node, children: [] };
        node.children?.forEach(n => {
            iterateNode(n);
            flatTree[ node.id ].children.push(n.id);
        });
    };

    iterateNode(tree);

    return flatTree;
};

const shallowClone = <T>(obj: T): T =>
    JSON.parse(JSON.stringify(obj));

const useFlatNodeTree = (initialTree: ComponentNode | (() => ComponentNode)) => {
    const [ tree, setTree ] = React.useState(treeToFlat(typeof initialTree === 'function' ? initialTree() : initialTree));

    const getParentId = React.useCallback((childId: string) => {
        if (!(childId in tree)) throw new Error('Child not found.')
        
        const parentId = Object.keys(tree).find(id => tree[ id ].children.includes(childId));
        if (!parentId) throw new Error('Parent not found.');
        
        return parentId;
    }, [ tree ]);

    const reparentNode = React.useCallback((childId: string, newParentId: string) => {
        const oldParentId = getParentId(childId);

        setTree(state => {
            let newState = shallowClone(state);

            newState[ oldParentId ].children = newState[ oldParentId ].children.filter(id => id !== childId);
            newState[ newParentId ].children.push(childId);

            return newState;
        });
    }, [ tree, getParentId ]);

    const updateNode = React.useCallback((id: string, newNodeState: Partial<FlatTreeNode>) => {
        setTree(state => {
            let newState = shallowClone(state);
            newState[ id ] = { ...newState[ id ], ...newNodeState }; 
            return newState;
        })
    }, [ tree ]);

    const addNode = React.useCallback((parentId: string, node: FlatTreeNode) => {
        setTree(state => {
            let newState = shallowClone(state);
            
            newState[ node.id ] = node;
            newState[ parentId ].children = [ ...newState[ parentId ].children, node.id ];

            return newState;
        });
    }, [ tree ]);

    const removeNode = React.useCallback((childId: string) => {
        const parentId = getParentId(childId);

        setTree(state => {
            let newState = shallowClone(state);

            newState[ parentId ].children = newState[ parentId ].children.filter(id => id !== childId);
            delete newState[ childId ];

            return newState;
        });
    }, [ tree ]);

    const moveNodeUp = React.useCallback((childId: string) => {
        const parentId = getParentId(childId);

        setTree(state => {
            let newState = shallowClone(state);

            const childIndex = newState[ parentId ].children.findIndex(id => id === childId);
            if (childIndex === 0) return newState;

            const tmpNode = newState[ parentId ].children[ childIndex - 1 ];
            newState[ parentId ].children[ childIndex - 1 ] = newState[ parentId ].children[ childIndex ];
            newState[ parentId ].children[ childIndex ] = tmpNode;

            return newState;
        });
    }, [ tree ]);

    const moveNodeDown = React.useCallback((childId: string) => {
        const parentId = getParentId(childId);

        setTree(state => {
            let newState = shallowClone(state);

            const childIndex = newState[ parentId ].children.findIndex(id => id === childId);
            if (childIndex === ) return newState;

            const tmpNode = newState[ parentId ].children[ childIndex - 1 ];
            newState[ parentId ].children[ childIndex - 1 ] = newState[ parentId ].children[ childIndex ];
            newState[ parentId ].children[ childIndex ] = tmpNode;

            return newState;
        });
    }, [ tree ]);

    return { tree, updateNode, reparentNode, addNode, removeNode };
};

export default useFlatNodeTree;