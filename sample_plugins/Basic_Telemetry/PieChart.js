const PieChart = ({ values }) => {
    const canvasRef = React.useRef(null);
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

    React.useEffect(() => {
        if (!canvasRef.current || Object.keys(values).length < 1) return;

        const context = canvasRef.current.getContext('2d');

        const drawSegment = (offset, angle, color) => {
            const startAngle = offset;
            const endAngle = offset + angle;
            const center = Math.min(width, height) / 2;
            const radius = center;
            const arcX = Math.sin(startAngle * 2 * Math.PI) * radius;
            const arcY = Math.cos(startAngle * 2 * Math.PI) * radius;

            context.fillStyle = color;
            context.beginPath();
            context.moveTo(center, center);
            context.lineTo(arcX, arcY);
            context.arc(center, center, radius, startAngle * 2 * Math.PI, endAngle * 2 * Math.PI);
            context.lineTo(center, center);
            context.fill();
        };

        const n = Object.values(values).reduce((acc, curr) => acc + curr, 0);
        let progress = 0;
        Object.values(values).forEach((value, index) => {
            const angle = value / n;
            drawSegment(progress, angle, getColor(index));
            progress += angle;
        });
    }, [ canvasRef, values ]);


    return React.createElement(
        'div',
        {
            key: id,
            className: 'flex items-center gap-4'
        },
        [
            React.createElement(
                'canvas',
                {
                    ref: canvasRef,
                    key: `${ id }-canvas`,
                    width,
                    height
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