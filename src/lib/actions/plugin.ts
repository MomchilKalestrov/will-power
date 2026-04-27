'use server';
import {
    addPlugin,
    removePlugin,
    togglePlugin,
    runPluginSSA
} from '@/lib/actions/plugin.internal';
import authenticateSSA from '@/lib/authenticateSSA';

const _addPlugin = authenticateSSA(addPlugin);
const _removePlugin = authenticateSSA(removePlugin);
const _togglePlugin = authenticateSSA(togglePlugin);
const _runPluginSSA = authenticateSSA(runPluginSSA);

export {
    _addPlugin as addPlugin,
    _removePlugin as removePlugin,
    _togglePlugin as togglePlugin,
    _runPluginSSA as runPluginSSA
}