'use client';
import React from 'react';
import Link from 'next/link';
import { ChevronDown, PanelBottom, PanelTop, Puzzle, StickyNote, type LucideProps } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';

type history = ({ name: string, type: componentType })[];

type Props = {
    currentComponentName: string;
    type: componentType;
};

type lucideComponent = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>;

const icons: Record<componentType, lucideComponent> = {
    header: PanelTop,
    page: StickyNote,
    footer: PanelBottom,
    component: Puzzle
};

const colors: Record<componentType, string> = {
    header: 'green-900',
    page: 'cyan-900',
    footer: 'purple-900',
    component: 'rose-900'
};

const ComponentHistoryMenu: React.FC<Props> = ({ currentComponentName, type }) => {
    const [ history, setHistory ] = React.useState<history | undefined>(undefined);

    React.useEffect(() => {
        let currentHistory: history = history
            ?   [ ...history ]
            :   JSON.parse(localStorage.getItem('editorHistory') ?? '[]');
        
        currentHistory = currentHistory.filter(({ name }) => name !== currentComponentName).slice(0, 3);
        if (
            currentHistory.length === 0 ||
            currentHistory[ currentHistory.length - 1 ].name !== currentComponentName
        ) currentHistory.push({ name: currentComponentName, type });

        localStorage.setItem('editorHistory', JSON.stringify(currentHistory));
        setHistory(currentHistory);
    }, [ currentComponentName ]);

    if (!history) return;
    
    const Icon = icons[ type ];

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant='ghost'
                    className='flex gap-1 flex-nowrap items-center justify-between min-w-32'
                >
                    <Icon color={ `var(--color-${ colors[ type ] })` } />
                    <span className='grow text-center uppercase font-semibold'>{ currentComponentName }</span>
                    <ChevronDown />
                </Button>
            </PopoverTrigger>
            <PopoverContent className='grid min-w-32 w-[unset] p-2'>
                { history.map(({ name, type }) => (
                    <Button
                        variant='ghost'
                        key={ name }
                        value={ name }
                    >
                        <Link
                            href={ '/admin/editor/' + name }
                            className='w-full flex gap-1 flex-nowrap items-center'
                        >
                            <Icon color={ `var(--color-${ colors[ type ] })` } />
                            <span className='grow text-center'>{ name }</span>
                        </Link>
                    </Button>
                )) }
            </PopoverContent>
        </Popover>
    );
};

export default ComponentHistoryMenu;