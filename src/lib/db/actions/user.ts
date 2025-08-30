'use server';
import connect from '..';
import User from '@/models/user';
import { getServerSession } from 'next-auth';

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
    }
};

const hasAuthority = (requester: User[ 'role' ], target: User[ 'role' ]): boolean => {
    const roleArray: User[ 'role' ][] = [ 'editor', 'admin', 'owner' ];
    return roleArray.indexOf(requester) > roleArray.indexOf(target);
};

const deleteUser = async (usernameToDelete: string): Promise<boolean> => {
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
    deleteUser
};