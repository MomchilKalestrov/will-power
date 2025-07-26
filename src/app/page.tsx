'use client';
import { NextPage } from 'next';
import style from './page.module.css';
import GradientPicker from '@/components/propertiesPanel/gradientPicker';

const Page: NextPage = () => {
    return (
        <div>
            <GradientPicker value='radial-gradient(to center center, #ffffff, #000000)' onChange={ console.log } />
        </div>
    );
};

export default Page;