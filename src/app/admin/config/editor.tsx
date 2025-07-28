'use client';
import React from 'react';
import { setConfig as updateConfig, type config } from '@/lib/config';

type Props = {
    initialConfig: config;
};

const Editor: React.FC<Props> = ({ initialConfig }) => {
    const [ config, setConfig ] = React.useState<config>(initialConfig);

    return JSON.stringify(config);
};

export default Editor;