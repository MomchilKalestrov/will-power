'use client';
import { NextPage } from 'next';
import style from './page.module.css';
import GradientPicker from '@/components/propertiesPanel/gradientPicker';

const Page: NextPage = () => {
    return (
        <div>
            <GradientPicker value='#ffffff' onChange={ console.log } />
        </div>
    );
};

export default Page;