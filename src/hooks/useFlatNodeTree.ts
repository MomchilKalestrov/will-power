'use client';
import React from 'react';

const treeToMap = (tree: ComponentNode): Record<string, ComponentNode> => {
    let flatTree: Record<string, ComponentNode> = {};

    const iterateNode = (node: ComponentNode) => {
        flatTree[ node.id ] = node;
        node.children?.forEach(iterateNode);
    };

    iterateNode(tree);

    return flatTree;
};

const useFlatNodeTree = (initialTree: ComponentNode | (() => ComponentNode)) => {
    // technically speaking, the best option is to have a flat
    // Record<ID, node>, where the children are just other IDs, but it's too
    // late for that now.
    // 
    // If we were to use `useState`, we'd have to clone
    // both the map and tree, using something like
    // `JSON.parse(JSON.stringify(tree))`, which would make the `treeMap` lose
    // the reference to the nodes in `tree`, so instead we use a `useRef`,
    // which exists outside the state and is mutable...
    const [ initialTreeValue ] = React.useState<ComponentNode>(() => typeof initialTree === 'function' ? initialTree() : initialTree);
    const treeRef = React.useRef(initialTreeValue);
    const treeMapRef = React.useRef(treeToMap(initialTreeValue));
    
    // ...and we just recompile the component manually :DDDDD
    const [ , updateState ] = React.useState<any>();
    const recompile = React.useCallback(() => updateState({}), [ updateState ]);

    const setTree = React.useCallback<React.Dispatch<React.SetStateAction<ComponentNode>>>((dispatch) => {
        treeRef.current = typeof dispatch === 'function' ? dispatch(treeRef.current) : dispatch;
        treeMapRef.current = treeToMap(treeRef.current);
        recompile();
    }, [ treeMapRef, treeRef, recompile ]);

    const findNode = React.useCallback((id: string) => {
        const treeMap = treeMapRef.current;
        if (!(id in treeMap)) throw new Error('Node not found.');
        return treeMap[ id ];
    }, [ treeMapRef, treeRef ]);

    const isIndirectParent = React.useCallback((childId: string, parentId: string) => {
        if (childId === parentId) return true; // technically????

        const treeMap = treeMapRef.current;

        if (!(childId in treeMap)) throw new Error('Child not found');
        if (!(parentId in treeMap)) throw new Error('Parent not found');
    
        const recurse = (node: ComponentNode): boolean => {
            if (childId === node.id) return true;
            
            for (const child of (node.children ?? []))
                if (recurse(child)) return true;

            return false;
        };
    
        return recurse(treeMap[ parentId ]);
    }, [ treeMapRef ]);

    const getIndirectChildren = React.useCallback((id: string) => {
        const treeMap = treeMapRef.current;
        
        const ids: string[] = [];

        const recurse = (node: ComponentNode) =>
            node.children?.map(child => {
                ids.push(child.id);
                recurse(child);
            });
        recurse(treeMap[ id ]);

        return ids;
    }, [ treeMapRef.current ]);

    const getParentId = React.useCallback((childId: string) => {
        const treeMap = treeMapRef.current;

        if (!(childId in treeMap)) throw new Error('Child not found.');
        
        const parentId = Object.keys(treeMap).find(pId => treeMap[ pId ].children?.find(child => child.id === childId));
        if (!parentId) throw new Error('Parent not found.');
        
        return parentId;
    }, [ treeMapRef ]);

    const reparentNode = React.useCallback((childId: string, newParentId: string) => {
        const treeMap = treeMapRef.current;
        const tree = treeRef.current;

        if (tree.id === childId) throw new Error('Root cannot be reparented.');
        if (!(childId in treeMap)) throw new Error('Child not found.');
        if (!(newParentId in treeMap)) throw new Error('New parent not found.');
        
        const oldParentId = getParentId(childId);

        const childIndex = treeMap[ oldParentId ].children!.findIndex(child => child.id === childId);

        if (!treeMap[ newParentId ].acceptChildren) throw new Error('New parent doesn\'t accept children.');

        if (isIndirectParent(newParentId, childId)) throw new Error('Circular parenting detected.');

        if (!Array.isArray(treeMap[ newParentId ].children))
            treeMap[ newParentId ].children = [];
        treeMap[ newParentId ].children.push(treeMap[ oldParentId ].children![ childIndex ]);
        treeMap[ oldParentId ].children!.splice(childIndex, 1);

        recompile();
    }, [ treeMapRef, treeRef, getParentId, isIndirectParent, recompile ]);

    const updateNode = React.useCallback((id: string, newNodeState: Partial<Omit<ComponentNode, 'id' | 'children'>>) => {
        const treeMap = treeMapRef.current;

        if (!(id in treeMap)) throw new Error('Node not found.');

        Object
            .entries(newNodeState)
            .forEach(([ key, value ]) => {
                if (key === 'id' || key === 'children') return;
                treeMap[ id ][ key ] = value;
            });

        recompile();
    }, [ treeMapRef, recompile ]);

    const addNode = React.useCallback((parentId: string, node: ComponentNode) => {
        const treeMap = treeMapRef.current;
        
        if(!(parentId in treeMap)) throw new Error('Parent not found.');
        if (!treeMap[ parentId ].acceptChildren) throw new Error('Parent doesn\'t accept children.');
        
        treeMap[ node.id ] = node;

        if (!Array.isArray(treeMap[ parentId ].children))
            treeMap[ parentId ].children = [];
        treeMap[ parentId ].children.push(node);

        recompile();
    }, [ treeMapRef, recompile ]);

    const removeNode = React.useCallback((childId: string) => {
        const treeMap = treeMapRef.current;

        if (!(childId in treeMap)) throw new Error('Node not found.');
        
        const parentId = getParentId(childId);
        
        treeMap[ parentId ].children = treeMap[ parentId ].children!.filter(child => child.id !== childId);
        getIndirectChildren(childId).forEach(id => delete treeMap[ id ]);
        delete treeMap[ childId ];

        recompile();
    }, [ treeMapRef, getParentId, recompile ]);

    const moveNodeUp = React.useCallback((id: string) => {
        const treeMap = treeMapRef.current;

        if (!(id in treeMap)) throw new Error('Node not found.');
        
        const parentId = getParentId(id);

        const nodeIndex = treeMap[ parentId ].children!.findIndex(child => child.id === id);
        if (nodeIndex === 0) return;

        const tmp = treeMap[ parentId ].children![ nodeIndex - 1 ];
        treeMap[ parentId ].children![ nodeIndex - 1 ] = treeMap[ parentId ].children![ nodeIndex ];
        treeMap[ parentId ].children![ nodeIndex ] = tmp;

        recompile();
    }, [ treeMapRef, getParentId, recompile ]);

    const moveNodeDown = React.useCallback((id: string) => {
        const treeMap = treeMapRef.current;

        if (!(id in treeMap)) throw new Error('Node not found.');
        
        const parentId = getParentId(id);

        const nodeIndex = treeMap[ parentId ].children!.findIndex(child => child.id === id);
        if (nodeIndex === treeMap[ parentId ].children!.length - 1) return;

        const tmp = treeMap[ parentId ].children![ nodeIndex + 1 ];
        treeMap[ parentId ].children![ nodeIndex + 1 ] = treeMap[ parentId ].children![ nodeIndex ];
        treeMap[ parentId ].children![ nodeIndex ] = tmp;

        recompile();
    }, [ treeMapRef, getParentId, recompile ]);

    return {
        tree: treeRef.current,
        setTree,
        findNode,
        updateNode,
        addNode,
        removeNode,
        reparentNode,
        moveNodeDown,
        moveNodeUp
    };
};

export default useFlatNodeTree;