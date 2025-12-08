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
            onSubmit: onSubmitCode = 'alert("Result: " + JSON.stringify(submission));',
            title = 'Form',
            style = {}
        }) => {
            const uuid = React.useMemo(() => crypto.randomUUID(), []);
            const onSubmit = React.useCallback(({ currentTarget }) => {
                const submission = new FormData(currentTarget);
                eval(onSubmitCode);
            }, [ onSubmitCode ]);

            return React.createElement(
                'form',
                {
                    key: `${ uuid }-div`,
                    onSubmit,
                    style
                },
                [
                    React.createElement(
                        'p',
                        { key: `${ uuid }-title` },
                        [ title ]
                    ),
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
            styles: {
                color: {
                    type: 'color',
                    default: '#000000',
                    in: 'Styling'
                },
                background: {
                    type: 'background',
                    default: 'unset',
                    in: 'Styling'
                },
                font: {
                    type: 'font',
                    default: 'normal normal 1rem "Times New Roman", sans-serif',
                    in: 'Styling'
                },
                boxShadow: {
                    type: 'shadow',
                    default: 'none',
                    in: 'Styling'
                },
                borderRadius: {
                    type: 'css-units',
                    default: '0px 0px 0px 0px',
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    count: 4,
                    in: 'Styling'
                },
                width: {
                    type: 'css-units',
                    default: '100%',
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    in: 'Sizing',
                },
                height: {
                    type: 'css-units',
                    default: '100%',
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    in: 'Sizing',
                },
                boxSizing: {
                    type: 'keyword',
                    default: 'content-box',
                    in: 'Sizing'
                },
                margin: {
                    type: 'css-units',
                    default: '0px',
                    count: 4,
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    in: 'Positioning'
                },
                position: {
                    type: 'keyword',
                    default: 'static',
                    in: 'Positioning'
                },
                top: {
                    type: 'css-units',
                    default: '0px',
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    in: 'Positioning',
                    condition: {
                        key: 'position',
                        value: 'static',
                        comparison: 'different'
                    }
                },
                left: {
                    type: 'css-units',
                    default: '0px',
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    in: 'Positioning',
                    condition: {
                        key: 'position',
                        value: 'static',
                        comparison: 'different'
                    }
                },
                padding: {
                    type: 'css-units',
                    default: '0px 0px 0px 0px',
                    count: 4,
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    in: 'Sizing'
                },
                gap: {
                    type: 'css-units',
                    default: '0px',
                    count: 2,
                    units: [ 'px', 'cm', 'in', 'em', 'rem', 'vw', 'vh', '%' ],
                    in: 'Layout'
                },
            },
            attributes: {},
            enumerators: {
                boxSizing: {
                    values: [ 'border-box', 'content-box' ],
                    icon: false
                },
                position: {
                    values: [ 'static', 'relative', 'fixed', 'sticky', 'absolute' ],
                    icon: false
                }
            },
            acceptChildren: true,
            name: 'Form'
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
            options = [ '' ],
            required = 'false'
        }) => {
            const uuid = React.useMemo(() => crypto.randomUUID(), []);

            switch (type) {
                case 'checkbox':
                case 'radio':
                    return React.createElement(
                        'div',
                        { key: `${ label }-container` },
                        [
                            React.createElement(
                                'label',
                                { key: `${ label }-label` },
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
                                                required: Boolean(required),
                                                name: label,
                                                id: uuid,
                                                type,
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
                            type,
                            placeholder: label,
                            min,
                            max,
                            required: Boolean(required),
                            key: `${ label }-container`,
                            style: {
                                display: 'block'
                            }
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
                },
                required: {
                    type: 'enum',
                    default: 'false'
                }
            },
            styles: {},
            attributes: {},
            enumerators: {
                type: {
                    values: [ 'text', 'number', 'radio', 'checkbox' ]
                },
                required: {
                    values: [ 'true', 'false' ]
                }
            },
            acceptChildren: false,
            name: 'Form_Input'
        }
    },
];