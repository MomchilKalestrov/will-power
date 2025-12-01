import React from 'react';
import { getAllComponents, getComponentByName } from '@/lib/db/actions/';
import RenderNode from '@/components/renderNode';

const metadata: NodeMetadata = {
    props: {
        component: {
            type: 'enum'
        }
    },
    attributes: {},
    styles: {},
    enumerators: {
        component: {
            values: (await getAllComponents('component')) ?? [ 'ERROR!' ]
        }
    },
    acceptChildren: false
};

type Props = {
    component: string;
};

const Component: React.FC<Props> = ({ component: name }) => {
    const [ component, setComponent ] = React.useState<Component | undefined>();

    React.useEffect(() => {
        getComponentByName(name)
            .then((value) => setComponent(value!));
    }, [ name ]);

    return component ? (<RenderNode node={ component.rootNode } />) : (<></>);
};

export { metadata, Component };
export { Puzzle as Icon } from 'lucide-react';