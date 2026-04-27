'use server';
import {
    addTheme,
    removeTheme,
    selectTheme
} from '@/lib/actions/theme.internal';
import authenticateSSA from '@/lib/authenticateSSA';

const _addTheme = authenticateSSA(addTheme);
const _removeTheme = authenticateSSA(removeTheme);
const _selectTheme = authenticateSSA(selectTheme);

export {
    _addTheme as addTheme,
    _removeTheme as removeTheme,
    _selectTheme as selectTheme
}