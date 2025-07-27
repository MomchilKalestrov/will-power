'use client';
import { NextPage } from 'next';
import ShadowPicker from '@/components/propertiesPanel/ShadowPicker';

const Page: NextPage = () => {
    return (
        <div>
            <ShadowPicker value='inset 0px 0px 0px 0px #ffffff' onChange={ console.log } />
        </div>
    );
};

export default Page;