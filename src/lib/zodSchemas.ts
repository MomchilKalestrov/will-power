import z from 'zod';
import { validName, validPassword } from '@/lib/utils';

export const themeMetadataSchema = z.object({
    name: z.string().refine(validName, { error: 'The theme has an invalid filename.' })
});

export const pluginMetadataSchema = z.object({
    name: z.string().refine(validName, { error: 'The plugin has an invalid filename.' }),
    version: z.string().regex(/^\d{2}\.\d{2}\.\d{2}$/, 'Version must me formatted as `XX.XX.XX`.')
});

const editorVisibilityCondition: z.ZodType<any> = z.lazy(() =>
    z.union([
        z.object({
            key: z.string(),
            value: z.string(),
            and: editorVisibilityCondition,
            comparison: z.enum([ 'equal', 'different' ]).optional()
        }),
        z.object({
            key: z.string(),
            value: z.string(),
            or: editorVisibilityCondition,
            comparison: z.enum([ 'equal', 'different' ]).optional()
        }),
        z.object({
            key: z.string(),
            value: z.string(),
            comparison: z.enum([ 'equal', 'different' ]).optional()
        })
    ])
);

const styleBase = {
    default: z.string(),
    condition: editorVisibilityCondition.optional(),
    in: z.string()
};

const style = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('css-units'),
    ...styleBase,
    count: z.number().optional(),
    units: z.array(z.string())
  }),
  z.object({
    type: z.enum([ 'string','shadow','background','color','keyword','font' ]),
    ...styleBase
  })
]);

const attribute = z.object({
    type: z.enum([ 'string','enum' ]),
    default: z.any(),
    condition: editorVisibilityCondition.optional(),
    in: z.string()
});

const propStructure: z.ZodType<any> = z.lazy(() =>
    z.union([
        z.object({
            type: z.enum([ 'number', 'string', 'enum' ]),
            key: z.string()
        }),
        z.object({
            type: z.literal('object'),
            key: z.string(),
            structure: z.array(propStructure)
        }),
        z.object({
            type: z.literal('array'),
            key: z.string(),
            structure: propStructure
        })
    ])
);

const propSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.enum([ 'string', 'number', 'enum', 'line', 'code' ]),
        default: z.any().optional(),
        condition: editorVisibilityCondition.optional()
    }),
    z.object({
        type: z.literal('custom'),
        default: z.any().optional(),
        condition: editorVisibilityCondition.optional(),
        structure: propStructure
    })
]);

const enumeratorEntrySchema = z.object({
    values: z.array(z.string()),
    icon: z.boolean().optional()
});

export const blockMetadataSchema = z.object({
    props: z.record(z.string(), propSchema),
    attributes: z.record(z.string(), attribute),
    styles: z.record(z.string(), style),
    enumerators: z.record(z.string(), enumeratorEntrySchema),
    acceptChildren: z.boolean()
});

export const pluginModuleSchema = z.object({
    components: z.array(
        z.object({
            Icon: z.function(),
            Component: z.function(),
            metadata: blockMetadataSchema.extend({
                name: z.string().refine(validName, { error: 'The component has an invalid name.' })
            }) 
        })
    ).optional(),
    pages: z.array(
        z.object({
            Component: z.function(),
            name: z.string().refine(validName, { error: 'The component has an invalid name.' })
        })
    ).optional(),
    onLoad: z.function().optional()
});

export const configSchema = z.object({
    theme: z.string(),
    themes: z.array(z.string()),
    fonts: z.array(
        z.object({
            family: z.string(),
            url: z.string()
        })
    ),
    variables: z.array(
        z.union([
            z.object({
                type: z.literal('font'),
                id: z.string(),
                name: z.string(),
                family: z.string(),
                style: z.enum([ 'normal', 'italic' ]),
                size: z.string(),
                weight: z.enum([ 'normal', 'bold', 'lighter', 'bolder' ]),
                fallback: z.enum([ 'serif', 'sans-serif', 'monospace', 'cursive' ])
            }),
            z.object({
                type: z.literal('color'),
                id: z.string(),
                name: z.string(),
                color: z
                    .string()
                    .regex(
                        /^#(?:[0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i,
                        { message: 'The value is not a valid hex color code.' }
                    )
            })
        ])
    ),
    plugins: z.array(
        pluginMetadataSchema.extend({
            enabled: z.boolean()
        })
    )
});

export const updateConfigSchema = configSchema.partial();

export const userSchema = z.object({
    username: z
        .string()
        .refine(validName, { error: 'Username must contain only letters and underscores' }),
    password: z
        .preprocess(v =>
            (typeof v === 'string' && v.length !== 0)
            ?   v
            :   undefined,
            z
                .string()
                .refine(validPassword, { error: 'Password must be longer than 8 symbols, contain at least 2 characters and 1 special symbol' })
        ),
    role: z
        .enum([ 'editor', 'admin', 'owner' ])
});

export const updateUserSchema = userSchema.partial().extend({
    id: z.string().length(24)
});

export const componentNameSchema = z.string().min(1).refine(name => name === encodeURIComponent(name));

export const componentNodeSchema: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.string(),
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
        name: componentNameSchema,
        title: z.string(),
        description: z.string(),
        rootNode: componentNodeSchema
    })
]);