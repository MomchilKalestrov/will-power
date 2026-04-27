'use server';
import authenticateSSA from '@/lib/authenticateSSA';
import {
    getBlob,
    getBlobList,
    addBlob,
    existsBlob,
    deleteBlob,
} from '@/lib/actions/blob/internal';

const _getBlob = authenticateSSA(getBlob);
const _getBlobList = authenticateSSA(getBlobList);
const _addBlob = authenticateSSA(addBlob);
const _existsBlob = authenticateSSA(existsBlob);
const _deleteBlob = authenticateSSA(deleteBlob);

export {
    _getBlob as getBlob,
    _getBlobList as getBlobList,
    _addBlob as addBlob,
    _existsBlob as existsBlob,
    _deleteBlob as deleteBlob
};