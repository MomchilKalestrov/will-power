'use server';
import type z from 'zod';
import argon2 from 'argon2';
import { getServerSession } from 'next-auth';

import connect from '@/lib/db';
import { hasAuthority } from '@/lib/utils';
import { updateUserSchema, userSchema } from '@/lib/zodSchemas';

import User from '@/models/user';

const getAllUsers = async (): serverActionResponse<User[] | null> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
    try {
        await connect();
        const users = await User.aggregate<User>([
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

        return {
            success: true,
            value: JSON.parse(JSON.stringify(users))
        };
    } catch (error) {
        console.error('[db] getAllUsers error:', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const getUser = async (username: string): serverActionResponse<User | null> => {
    if (!await getCurrentUser())
        return {
            success: false,
            reason: 'Unauthorized action.'
        };
    
    if (typeof username !== 'string')
        return {
            success: false,
            reason: 'Malformed data.'
        };
    
    try {
        const user = await User.findOne({ username }).lean<any>();
        if (!user)
            return {
                success: false,
                reason: 'Not found.'
            };
        return {
            success: true,
            value: JSON.parse(JSON.stringify({
                ...user,
                id: user._id,
                _id: undefined,
                passwordHash: undefined
            }))
        };
    } catch (error) {
        console.error('[db] getUser error:', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
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

const updateUser = async (userState: z.infer<typeof updateUserSchema>): serverActionResponse<boolean> => {
    const currentUser = await getCurrentUser();
    if (!currentUser)
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    try {
        const { id, ...data } = updateUserSchema.parse(userState);

        const targetUser = await User.findById(id);
        
        if (
            !hasAuthority(currentUser.role, targetUser.role) ||
            (data.role && !hasAuthority(currentUser.role, data.role))
        )
            return {
                success: false,
                reason: 'Unauthorized action.'
            };

        const { password, ...rest } = data;
        const newData: any = password
        ?   { ...rest, passwordHash: await argon2.hash(password) }
        :   rest;

        await User.updateOne(
            { _id: id },
            { $set: newData },
            { runValidators: true }
        );

        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.error('[db] updateUser error:', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const deleteUser = async (id: string): serverActionResponse<boolean> => {
    if (typeof id !== 'string')
        return {
            success: false,
            reason: 'Malformed data.'
        };
    
    const currentUser = await getCurrentUser();
    if (!currentUser)
        return {
            success: false,
            reason: 'Unauthorized action.'
        };

    try {
        const targetUser = await User.findById(id);
        
        if (!hasAuthority(currentUser.role, targetUser.role))
            return {
                success: false,
                reason: 'Unauthorized action.'
            };
        await User.findByIdAndDelete(id);

        return {
            success: true,
            value: true
        };
    } catch (error) {
        console.error('[db] deleteUser error:', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
};

const createUser = async (userState: z.infer<typeof userSchema>): serverActionResponse<string> => {
    try {
        const user = await getCurrentUser();
        if (!user || !hasAuthority(user.role, 'owner', 0))
            return {
                success: false,
                reason: 'Unauthorized action.'
            };

        const { password, ...data } = userSchema.parse(userState);
        const result = await new User({
            ...data,
            passwordHash: await argon2.hash(password)
        }).save();

        return {
            success: true,
            value: result.id.toString()
        };
    } catch (error) {
        console.error('[db] deleteUser error:', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
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