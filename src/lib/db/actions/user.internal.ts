import 'server-only';
import type z from 'zod';
import argon2 from 'argon2';

import { hasAuthority } from '@/lib/utils';
import { addAuthInfo } from '@/lib/authenticateSSA';
import { updateUserSchema, userSchema } from '@/lib/zod/userSchemas';

import connect from '@/lib/db';

import User from '@/models/user';

export const getAllUsers = addAuthInfo(async (_: User): serverActionResponse<User[]> => {
    try {
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
}, 'strong');

export const getUser = addAuthInfo(async (_: User, username: string): serverActionResponse<User | null> => {
    if (typeof username !== 'string')
        return {
            success: false,
            reason: 'Malformed data.'
        };
    
    try {
        const user = await User.findOne({ username }).lean();
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
}, 'strong');

export const updateUser = addAuthInfo(async (currentUser: User, userState: z.infer<typeof updateUserSchema>): serverActionResponse<boolean> => {
    try {
        const { id, ...data } = updateUserSchema.parse(userState);

        const targetUser = await User.findById(id);
        if (!targetUser)
            return {
                success: false,
                reason: 'Not found.'
            };
        
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
}, 'strong');

export const deleteUser = addAuthInfo(async (currentUser: User, id: string): serverActionResponse<boolean> => {
    if (typeof id !== 'string')
        return {
            success: false,
            reason: 'Malformed data.'
        };

    try {
        const targetUser = await User.findById(id);
        if (!targetUser)
            return {
                success: false,
                reason: 'Not found.'
            };
        
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
}, 'strong');

export const createUser = addAuthInfo(async (currentUser: User, userState: z.infer<typeof userSchema>): serverActionResponse<string> => {
    try {
        if (!hasAuthority(currentUser.role, 'owner', 0))
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
        console.error('[db] createUser error:', error);
        return {
            success: false,
            reason: `Server error ${ error instanceof Error ? error.message : '' }.`
        };
    };
}, 'strong');