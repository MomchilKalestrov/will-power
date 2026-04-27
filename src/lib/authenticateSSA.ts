import { getCurrentUser } from '@/lib/db/actions/user.internal';

type OmitFirst<T extends unknown[]> = T extends [ unknown, ...infer Rest ] ? Rest : never;

function authenticateSSA<T extends (user: User, ...args: any[]) => serverActionResponse<any>>(
    func: T,
    weak?: false
): (...args: OmitFirst<Parameters<T>>) => ReturnType<T>;

function authenticateSSA<T extends (user: User | undefined, ...args: any[]) => serverActionResponse<any>>(
    func: T,
    weak: true
): (...args: OmitFirst<Parameters<T>>) => ReturnType<T>;

function authenticateSSA<T extends (user: User | undefined, ...args: any[]) => serverActionResponse<any>>(
    func: T,
    weak = false
): (...args: OmitFirst<Parameters<T>>) => ReturnType<T> {
    return (async (...args: OmitFirst<Parameters<T>>) => {
        const user = await getCurrentUser() ?? undefined;

        if (!user && !weak) return {
            success: false,
            reason: 'Unauthorized action.'
        };

        return await func(user, ...args);
    }) as (...args: OmitFirst<Parameters<T>>) => ReturnType<T>;
}

export default authenticateSSA;