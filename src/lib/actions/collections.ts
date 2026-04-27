'use server';
import {
    createCollection,
    deleteCollection,
    readDocuments,
    createDocument,
    updateDocument,
    deleteDocument
} from '@/lib/actions/collections.internal';
import authenticateSSA from '@/lib/authenticateSSA';

const _createCollection = authenticateSSA(createCollection);
const _deleteCollection = authenticateSSA(deleteCollection);
const _readDocuments = authenticateSSA(readDocuments, true);
const _createDocument = authenticateSSA(createDocument, true);
const _updateDocument = authenticateSSA(updateDocument, true);
const _deleteDocument = authenticateSSA(deleteDocument, true);

export {
    _createCollection as createCollection,
    _deleteCollection as deleteCollection,
    _readDocuments as readDocuments,
    _createDocument as createDocument,
    _updateDocument as updateDocument,
    _deleteDocument as deleteDocument
}