'use server';
import authenticateSSA from '@/lib/authenticateSSA';
import {
    getComponentByName,
    getAllComponents,
    saveComponent,
    createComponent,
    deleteComponent,
    getMatchingComponents
} from '@/lib/db/actions/component.internal';

const _getAllComponents = authenticateSSA(getAllComponents);
const _saveComponent = authenticateSSA(saveComponent);
const _createComponent = authenticateSSA(createComponent);
const _deleteComponent = authenticateSSA(deleteComponent);

export {
    getComponentByName,
    getMatchingComponents,
    _getAllComponents as getAllComponents,
    _saveComponent as saveComponent,
    _createComponent as createComponent,
    _deleteComponent as deleteComponent
};