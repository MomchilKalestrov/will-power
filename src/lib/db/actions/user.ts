'use server';
import authenticateSSA from '@/lib/authenticateSSA';
import {
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    createUser
} from '@/lib/db/actions/user.internal';

const _getAllUsers = authenticateSSA(getAllUsers);
const _getUser = authenticateSSA(getUser);
const _updateUser = authenticateSSA(updateUser);
const _deleteUser = authenticateSSA(deleteUser);
const _createUser = authenticateSSA(createUser);

export {
    _getAllUsers as getAllUsers,
    _getUser as getUser,
    _updateUser as updateUser,
    _deleteUser as deleteUser,
    _createUser as createUser
};