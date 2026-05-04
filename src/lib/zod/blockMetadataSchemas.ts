import z from 'zod';

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
    type: z.enum([ 'string','shadow','background','color','keyword','font','border' ]),
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
        }),
        z.object({
            type: z.literal('file'),
            key: z.string(),
            format: z.enum([ 'font', 'all', 'image', 'video', 'audio' ])
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
    }),
    z.object({
        type: z.literal('file'),
        format: z.enum([ 'font', 'all', 'image', 'video', 'audio' ]),
        default: z.any().optional(),
        condition: editorVisibilityCondition.optional()
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