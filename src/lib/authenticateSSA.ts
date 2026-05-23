import { auth } from '@/lib/auth';

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
): {
    (...args: OmitFirst<Parameters<T>>): ReturnType<T>;
    auth: 'weak' | 'strong';
} {
    const wrapper: any = async (...args: OmitFirst<Parameters<T>>) => {
        const session = await auth();

        if (!session && !weak) return {
            success: false,
            reason: 'Unauthorized action.'
        };

        return await func(
            session
            ? {
                id: session.user.id,
                username: session.user.name,
                role: session.user.role
            }
            : undefined,
            ...args
        );
    };

    wrapper.auth = weak ? 'weak' : 'strong';

    return wrapper as ReturnType<typeof authenticateSSA>;
};

export function addAuthInfo<T extends (user: User, ...args: any[]) => serverActionResponse<any>>(
    func: T,
    auth: 'strong'
): T & { auth: 'strong'; };

export function addAuthInfo<T extends (user: User | undefined, ...args: any[]) => serverActionResponse<any>>(
    func: T,
    auth: 'weak'
): T & { auth: 'weak'; };

export function addAuthInfo<T extends (user: User | undefined, ...args: any[]) => serverActionResponse<any>>(
    func: T,
    type: 'weak' | 'strong'
): T & { auth: typeof type; } {
    return Object.assign(
        func,
        { auth: type }
    );
};

export default authenticateSSA;