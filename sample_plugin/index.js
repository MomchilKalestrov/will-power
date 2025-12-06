const FormCTX = React.createContext();

export const components = [
    {
        Icon: props =>
            React.createElement(
                'svg',
                {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: 24,
                    height: 24,
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    ...props
                },
                [
                    ReactJsxRuntime.jsx('path', { d: 'M4 14h6' }, 'p1'),
                    ReactJsxRuntime.jsx('path', { d: 'M4 2h10' }, 'p2'),
                    ReactJsxRuntime.jsx('rect', {
                        x: '4', y: '18',
                        width: '16', height: '4',
                        rx: '1'
                    }, 'r1'),
                    ReactJsxRuntime.jsx('rect', {
                        x: '4', y: '6',
                        width: '16', height: '4',
                        rx: '1'
                    }, 'r2'),
                ]
            ),
        Component: ({
            children,
            onSubmit: onSubmitCode = 'alert("Result: " + JSON.stringify(submission));'
        }) => {
            const [ values, setValues ] = React.useState({});
            const onSubmit = React.useCallback(() => {
                const submission = Object.freeze(
                    Object.fromEntries(
                        Object.entries(values)
                            .map(([ key, value ]) => 
                                [ key, value instanceof Set ? [ ...value ] : value ]
                            )
                    )
                );

                eval(onSubmitCode);
            }, [ values, onSubmitCode ]);
            const updateValue = React.useCallback((key, value) =>
                setValues(state => ({ ...state, [ key ]: value }))
            , []);
            const uuid = React.useMemo(() => crypto.randomUUID(), []);

            return React.createElement(
                FormCTX.Provider,
                {
                    value: { onSubmit, updateValue, values },
                    key: uuid
                },
                [
                    React.createElement(
                        'div',
                        {
                            key: `${ uuid }-div`
                        },
                        [
                            ...children,
                            React.createElement(
                                'button',
                                {
                                    onClick: onSubmit,
                                    key: `${ uuid }-div`
                                },
                                'Submit'
                            )
                        ]
                    )
                ]
            );
        },
        metadata: {
            props: {
                onSubmit: {
                    type: 'code',
                    default: 'alert("Result: " + JSON.stringify(submission));'
                },
                title: {
                    type: 'line',
                    default: 'Form'
                }
            },
            styles: {},
            attributes: {},
            enumerators: {},
            acceptChildren: true,
            name: 'Form',
            type: 'component'
        }
    },
    {
        Icon: props =>
            React.createElement(
                'svg',
                {
                    xmlns: 'http://www.w3.org/2000/svg',
                    width: 24,
                    height: 24,
                    viewBox: '0 0 24 24',
                    fill: 'none',
                    stroke: 'currentColor',
                    strokeWidth: 2,
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    ...props
                },
                [
                    ReactJsxRuntime.jsx('path', { d: 'M13 8h7a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-7' }, 'p1'),
                    ReactJsxRuntime.jsx('path', { d: 'M5 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1' }, 'p2'),
                    ReactJsxRuntime.jsx('path', { d: 'M6 4h1a2 2 0 0 1 2 2 2 2 0 0 1 2-2h1' }, 'p3'),
                    ReactJsxRuntime.jsx('path', { d: 'M9 6v12' }, 'p4')
                ]
            ),
        Component: ({
            label = 'Input: ',
            type = 'text',
            min = '0',
            max = '100',
            options = []
        }) => {
            const context = React.useContext(FormCTX);
            const onChange = React.useCallback((event) => {
                if (!context || !event.currentTarget) return;
                const { updateValue, values } = context;
                const { value: targetValue } = event.currentTarget;

                let value;
                switch (type) {
                    case 'radio':
                    case 'checkbox':
                        value = new Set(type === 'radio' ? [] : values[ label ]);
                        if (value.has(targetValue))
                            value.delete(targetValue);
                        else
                            value.add(targetValue);
                        break;
                    case 'text':
                        value = targetValue;
                        break;
                    case 'number':
                        value = Number(targetValue);
                        break;
                };

                updateValue(label, value);
            }, [ context, type ]);
            const uuid = React.useMemo(() => crypto.randomUUID(), []);

            if (!context) return '"Form Input" cannot be used outside a "Form" block.';
            const { values } = context;
            
            const value = values[ label ];
            switch (type) {
                case 'checkbox':
                case 'radio':
                    return React.createElement(
                        'div',
                        {
                            key: `${ label }-container`
                        },
                        [
                            React.createElement(
                                'label',
                                {
                                    key: `${ label }-label`
                                },
                                [ label ]
                            ),
                            ...options.map(option =>
                                React.createElement(
                                    'div',
                                    { key: `${ option }-container` },
                                    [
                                        React.createElement(
                                            'input',
                                            {
                                                name: label,
                                                id: uuid,
                                                type,
                                                value: option,
                                                checked: (!!value !== false) && value.has(option),
                                                onChange,
                                                key: `${ option }-input`
                                            }
                                        ),
                                        React.createElement(
                                            'label',
                                            {
                                                htmlFor: uuid,
                                                key: `${ option }-container`
                                            },
                                            [ option ]
                                        )
                                    ]
                                )
                            )
                        ]
                    );
                case 'text':
                case 'number':
                    return React.createElement(
                        'input',
                        {
                            onChange,
                            type,
                            placeholder: label,
                            min,
                            max,
                            key: `${ label }-container`,
                            value: value?.toString() ?? ''
                        }
                    );
            };
        },
        metadata: {
            props: {
                label: {
                    type: 'line',
                    default: 'Input: '
                },
                type: {
                    type: 'enum',
                    default: 'text'
                },
                min: {
                    type: 'number',
                    default: '0',
                    condition: {
                        key: 'type',
                        value: 'number',
                        comparison: 'equal'
                    }
                },
                max: {
                    type: 'number',
                    default: '100',
                    condition: {
                        key: 'type',
                        value: 'number',
                        comparison: 'equal'
                    }
                },
                options: {
                    type: 'custom',
                    structure: {
                        type: 'array',
                        key: 'options',
                        structure: {
                            type: 'string',
                            key: 'option',
                            default: ''
                        }
                    },
                    condition: {
                        key: 'type',
                        value: 'radio',
                        comparison: 'equal',
                        or: {
                            key: 'type',
                            value: 'checkbox',
                            comparison: 'equal'
                        }
                    }
                }
            },
            styles: {},
            attributes: {},
            enumerators: {
                type: {
                    values: [ 'text', 'number', 'radio', 'checkbox' ]
                }
            },
            acceptChildren: false,
            name: 'Form_Input',
            type: 'component'
        }
    },
];