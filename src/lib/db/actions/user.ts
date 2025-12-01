'use server';
import z from 'zod';
import argon2 from 'argon2';
import { getServerSession } from 'next-auth';

import connect from '@/lib/db';
import { hasAuthority } from '@/lib/utils';
import { updateUserSchema, userSchema } from '@/lib/zodSchemas';

import User from '@/models/user';

const getAllUsers = async (): Promise<User[] | null> => {
    try {
        if (!await getServerSession()) return [];

        await connect();
        const users = await User.aggregate([
            { $project: {
                id: '$_id',
                username: 1,
                role: 1
            } },
            { $project: {
                _id: 0,
                passwordHash: 0
            } }
        ]);
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error('[db] getAllUsers error:', error);
        return null;
    };
};

const getUser = async (username: string): Promise<User | null> => {
    if (typeof username !== 'string') return null;
    
    try {
        if (!await getServerSession()) return null;
        return await User.findOne<User | null>({ username });
    } catch (error) {
        console.error('[db] getUser error:', error);
        return null;
    };
};

const getCurrentUser = async (): Promise<User | null> => {    
    try {
        const session = await getServerSession();
        if (!session) return null;
        return await User.findOne<User | null>({ username: session.user?.name });
    } catch (error) {
        console.error('[db] getCurrentUser error:', error);
        return null;
    };
};

const updateUser = async (userState: z.infer<typeof updateUserSchema>): Promise<boolean> => {
    try {
        const { id, ...data } = updateUserSchema.parse(userState);
        const session = await getServerSession();
        if (!session)
            return false;

        const currentUsername = session.user!.name;
        const users = await User.find<{ username: string, role: User[ 'role' ] }>(
            { $or: [
                { username: currentUsername },
                { _id: id }
            ] },
            { username: 1, role: 1 }
        ).lean();
        
        const currentUserRole = users.find(u => u.username === session.user!.name)!.role as User[ 'role' ];
        const targetUserRole = users.find(u => u._id!.toString() === id)!.role as User[ 'role' ];

        if (
            !hasAuthority(currentUserRole, targetUserRole) ||
            (data.role && !hasAuthority(currentUserRole, data.role))
        )
            return false;

        const { password, ...rest } = data;
        const newData: any = password
        ?   { ...rest, passwordHash: await argon2.hash(password) }
        :   rest;

        await User.updateOne(
            { _id: id },
            { $set: newData },
            { runValidators: true }
        );

        return true;
    } catch (error) {
        console.error('[db] updateUser error:', error);
        return false;
    };
};

const deleteUser = async (usernameToDelete: string): Promise<boolean> => {
    if (typeof usernameToDelete !== 'string') return false;

    try {
        const session = await getServerSession();
        if (!session) return false;

        const currentUsername = session.user!.name;
        const users = await User.find<{ username: string, role: User[ 'role' ] }>(
            { username: { $in: [ usernameToDelete, currentUsername ] } },
            { username: 1, role: 1 }
        ).lean();
        const userMap = new Map(users.map(doc => [ doc.username, doc ]));
        const userToDelete = userMap.get(usernameToDelete)!;
        const currentUser = userMap.get(currentUsername)!;

        if (!hasAuthority(currentUser.role, userToDelete.role))
            return false;
        await User.deleteOne({ username: usernameToDelete });
        return true;
    } catch (error) {
        console.error('[db] deleteUser error:', error);
        return false;
    };
};

const createUser = async (userState: z.infer<typeof userSchema>): Promise<string | null> => {
    try {
        const user = await getCurrentUser();
        if (!user || !hasAuthority(user.role, 'owner', 0)) return null;

        const { password, ...data } = userSchema.parse(userState);
        const result = await new User({
            ...data,
            passwordHash: await argon2.hash(password)
        }).save();

        return result.id.toString();
    } catch (error) {
        console.error('[db] deleteUser error:', error);
        return null;
    };
};

export {
    getAllUsers,
    getUser,
    getCurrentUser,
    createUser,
    updateUser,
    deleteUser
};