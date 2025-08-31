'use server';
import { getServerSession } from 'next-auth';
import connect from '@/lib/db';
import { hasAuthority, validName, validPassword } from '@/lib/utils';
import User from '@/models/user';
import z from 'zod';
import argon2 from 'argon2';

const userSchema = z.object({
    id: z
        .string()
        .length(24),
    username: z
        .string()
        .refine(validName, { error: 'Username may contain only letters and underscores' })
        .optional(),
    password: z
        .preprocess(v =>
            (typeof v === 'string' && v.length !== 0)
            ?   v
            :   undefined,
            z
                .string()
                .refine(validPassword, { error: 'Password must be longer than 8 symbols, contain at least 2 characters and 1 special symbol' })
                .optional()
        ),
    role: z
        .enum([ 'editor', 'admin', 'owner' ])
        .optional()
});

const getAllUsers = async (): Promise<User[]> => {
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
        return JSON.parse(JSON.stringify(users));
    } catch (error) {
        console.error('[db] getAllUsers error:', error instanceof Error ? error.stack || error.message : error);
        return [];
    };
};

const updateUser = async (userState: User & { password: string }): Promise<boolean> => {
    try {
        const { id, ...data } = userSchema.parse(userState);
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
        
        let currentUserRole = users.find(u => u.username === session.user!.name)!.role as User[ 'role' ];
        let targetUserRole = users.find(u => u._id!.toString() === id)!.role as User[ 'role' ];

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
        console.error('[db] updateUser error:', error instanceof Error ? error.stack || error.message : error);
        return false;
    };
};

const deleteUser = async (usernameToDelete: string): Promise<boolean> => {
    if (typeof usernameToDelete !== 'string') return false;

    try {
        const session = await getServerSession();
        if (!session)
            return false;

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
        console.error('[db] deleteUser error:', error instanceof Error ? error.stack || error.message : error);
        return false;
    };
};

export {
    getAllUsers,
    updateUser,
    deleteUser
};