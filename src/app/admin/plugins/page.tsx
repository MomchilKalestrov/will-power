'use client';
import { NextPage } from 'next';

import { usePlugins } from '@/contexts/plugins';

import PluginCard from './pluginCard';
import AddPluginDialog from './addPluginDialog';

// Oct 21 17:02:29
// I am back to feeling soulless. Well, I do have feelings. just that they are
// pain and sadness.
// 
// I felt embarrassed today. Aparently (they) told me they liked me just to com
// firm a suspicion of theirs. Why?? It's abundantly clear I do have a crush on
// them, so why the damn hastle? It was dehumanizing. Even more so that they th
// ink it's just "bothering me". It wasn't. It was eating at me. The whole damn
// weekend. I couldn't focus on my russian lessons. Just thinking about whether
// they were serious or not. Only to come to the conclusion that it wasn't and 
// joke and then be told "No, I just wanted to comfim a theory about you".
// 
// I had to cross the boulevard to get to the bank today. While I was waiting f
// or the light to turn green, I just looked at the cars and wondered whether t
// hey were going fast enough to end my sufferring.
// 
// As much as I wish I could pretend I'm fine, I just can't. This is something 
// I'm simply unable to shrug off. I can understand that they aren't interested
// in a relationship, but I can't grasp the fact that they would do something s
// o fucked up.
// 
// I hope I can forgive them, but as much as I love them, I might need to force
// myself not to just out of self respect.
// 
// So far for "you can never do me any wrong"...

const Page: NextPage = () => {
    const { plugins } = usePlugins();

    return (
        <div className='p-8 flex flex-wrap justify-center gap-2'>
            { [ ...plugins.values() ].map(plugin => (
                <PluginCard key={ plugin.name } plugin={ plugin } />
            )) }
            <AddPluginDialog />
        </div>
    );
};

export default Page;