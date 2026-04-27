'use server';
import {
    addPlugin,
    removePlugin,
    togglePlugin
} from '@/lib/actions/plugin.internal';
import authenticateSSA from '@/lib/authenticateSSA';

const _addPlugin = authenticateSSA(addPlugin);
const _removePlugin = authenticateSSA(removePlugin);
const _togglePlugin = authenticateSSA(togglePlugin);

export {
    _addPlugin as addPlugin,
    _removePlugin as removePlugin,
    _togglePlugin as togglePlugin
}