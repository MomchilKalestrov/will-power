'use server';
import {
    getConfig,
    setConfig,
} from '@/lib/actions/config.internal';
import authenticateSSA from '@/lib/authenticateSSA';

const _setConfig = authenticateSSA(setConfig);

export {
    getConfig,
    _setConfig as setConfig
};