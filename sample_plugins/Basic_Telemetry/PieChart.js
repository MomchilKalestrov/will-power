const PieChart = ({ values }) => {
    const id = React.useId();
    const width = 200;
    const height = 200;

    const getColor = React.useCallback(index => {
        const colors = [ 
            '#EF5350',
            '#4CAF50',
            '#CDDC39',
            '#9C27B0',
            '#673AB7',
            '#E91E63',
            '#2196F3',
            '#009688',
            '#FFC107',
            '#FF5722'
        ];

        return colors[ index % colors.length ];
    }, []);

    const gradientStops = React.useMemo(() => {
        if (!values || Object.keys(values).length < 1) return '';
        
        const n = Object.values(values).reduce((acc, curr) => acc + curr, 0);
        let progress = 0;
        const stops = [];
        
        Object.values(values).forEach((value, index) => {
            const percentage = (value / n) * 100;
            const startPercentage = progress;
            const endPercentage = progress + percentage;
            
            stops.push(`${getColor(index)} ${startPercentage}% ${endPercentage}%`);
            progress = endPercentage;
        });
        
        return stops.join(', ');
    }, [values, getColor]);


    return React.createElement(
        'div',
        {
            key: id,
            className: 'flex items-center gap-4'
        },
        [
            React.createElement(
                'div',
                {
                    key: `${ id }-pie`,
                    style: {
                        width,
                        height,
                        borderRadius: '50%',
                        background: `conic-gradient(${gradientStops})`
                    }
                }
            ),
            React.createElement(
                'div',
                { key: `${ id }-names` },
                Object.keys(values).map((name, index) =>
                    React.createElement(
                        'div',
                        {
                            key: `${ id }-names-${ index }`,
                            className: 'flex items-center gap-2'
                        },
                        [
                            React.createElement(
                                'div',
                                {
                                    key: `${ id }-names-container-${ index }`,
                                    className: 'size-2 rounded-xl',
                                    style: { backgroundColor: getColor(index) }
                                }
                            ),
                            name
                        ]
                    )
                )
            )
        ]
    );
};

export default PieChart;