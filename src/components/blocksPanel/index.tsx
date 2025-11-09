'use client';
import React from 'react';
import { useComponentDb, type componentData } from '@/components/componentDbProvider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

type Props = {
    onNodeAdd: (type: string, acceptChildren: boolean) => void;
};

const ComponentButton: React.FC<Props & { type: string }> = ({ type, onNodeAdd }) => {
    const { getComponent } = useComponentDb();
    const [ Data, setData ] = React.useState<componentData | null>();

    React.useEffect(() => {
        getComponent(type)
            .then(setData)
    }, [ type ]);

    if (!Data) return (<></>);

    return (
        <Button
            variant="outline"
            className='grow basis-24 max-w-32 aspect-square flex flex-col items-center justify-center p-2 m-0 gap-0 h-auto'
            onClick={() => onNodeAdd(type, Data.metadata.acceptChildren) }
        >
            <Data.Icon className='size-[50%] opacity-75' />
            <span className='mt-2 text-sm font-semibold'>{ type }</span>
        </Button>
    );
};

const BlockPanel: React.FC<Props> = ({ onNodeAdd }) => {
    const { components } = useComponentDb();

    return (
        <div className='grid gap-4 h-full grid-rows-[min-content_min-content_1fr]'>
            <h3 className='text-lg font-bold'>Add</h3>
            <Separator/>
            <div className='overflow-y-scroll'>
                <div className='flex flex-wrap gap-2 justify-center'>
                    { components.map((componentType) => (
                    <ComponentButton
                        key={ componentType }
                        type={ componentType }
                        onNodeAdd={ onNodeAdd }
                    />
                )) }
                </div>
            </div>
        </div>
    );
};

export default BlockPanel;
