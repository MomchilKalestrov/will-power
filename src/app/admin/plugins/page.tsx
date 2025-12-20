'use client';
import { NextPage } from 'next';

import { usePlugins } from '@/contexts/plugins';

import PluginCard from './pluginCard';

// Dec 20 15:04:03
// Life's OK. I'm making moderate progress on this project. I don't know why I 
// don't just make a journal instead of hiding messages in ramdom commints. Mig
// ht just do that... I'm suspecting Tanya of having a crush on me. She's const
// antly hovering close by me when I'm around. Complemented my clothing two tim
// es in a row, too. Such is life. Really wanna get a walkman, in other news. T
// hey're expensive as shit, though.

const Page: NextPage = () => {
    const { plugins } = usePlugins();

    return (
        <div className='p-8 overflow-y-scroll h-[calc(100dvh-var(--spacing)*16)] flex flex-wrap justify-center items-start content-start gap-2'>
            { [ ...plugins.values() ].map(plugin => (
                <PluginCard key={ plugin.name } plugin={ plugin } />
            )) }
        </div>
    );
};

export default Page;