import z from 'zod';

export const componentNameSchema = z.string().min(1).refine(name => {
    if (name.startsWith('/') || name.endsWith('/')) return false;
    const [ first, ...segments ] = name.split('/');
    if (
        first === 'admin' ||
        first === 'public' ||
        first !== encodeURIComponent(first) ||
        !segments.every(segment => segment === encodeURIComponent(segment))
    )
        return false;
    return true;
});

export const componentNodeSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.string(),
        name: z.string(),
        type: z.string(),
        style: z.record(z.string(), z.string()),
        attributes: z.record(z.string(), z.string()),
        props: z.looseObject({}),
        acceptChildren: z.boolean(),
        children: z.array(componentNodeSchema)
    })
);

export const componentTypesSchema = z.enum([ 'header', 'page', 'footer', 'component' ]);

export const componentSchema = z.union([
    z.object({
        type: z.enum([ 'header', 'footer' ]),
        name: componentNameSchema,
        lastEdited: z.number(),
        rootNode: componentNodeSchema,
        displayCondition: z.array(
            z.union([
                z.object({
                    show: z.literal('all'),
                }),
                z.object({
                    show: z.enum([ 'page', 'exclude' ]),
                    name: z.string()
                })
            ])
        ).min(1)
    }),
    z.object({
        type: z.enum([ 'component' ]),
        name: componentNameSchema,
        lastEdited: z.number(),
        rootNode: componentNodeSchema
    }),
    z.object({
        type: z.enum([ 'page' ]),
        name: componentNameSchema.refine(v => {
            // when using FC blob adapter, we need the `/public` route reserved,
            // since assets will be available on `/public/[...path]`
            if (!process.env.NEXT_PUBLIC_BLOB_URL && v === 'public')
                return false;
            if (v === 'admin')
                return false;
            return true;
        }, { error: 'Invalid name' }),
        title: z.string(),
        description: z.string(),
        rootNode: componentNodeSchema
    })
]);