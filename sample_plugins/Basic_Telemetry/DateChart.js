const DateChart = ({ values }) => {
    const id = React.useId();
    const max = React.useMemo(() =>
        Object
            .values(values)
            .reduce((acc, curr) => Math.max(acc, curr), 1)
    , [ values ]);
    const [ offset, setOffset ] = React.useState(0);
    const [ firstDate, lastDate ] = React.useMemo(() => {
        const sortedKeys =
            Object
                .keys(values)
                .sort();
        
        const firstDate = new Date(sortedKeys[ 0 ]);
        const lastDate = new Date(sortedKeys.pop());

        return [ firstDate, lastDate ];
    }, [ values ]);
    const [ columnCount, setColumnCount ] = React.useState(() => {
        const main = [ ...document.getElementsByTagName('main') ][ 0 ];
        if (!main) return 10;
        return Math.floor(main.getBoundingClientRect().width / 32);
    });

    React.useEffect(() => {
        const onResize = () => {
            const main = [ ...document.getElementsByTagName('main') ][ 0 ];
            main && setColumnCount(Math.floor(main.getBoundingClientRect().width / 32));
        };

        window.addEventListener('resize', onResize);
        return () => {
            window.removeEventListener('resize', onResize)
        };
    }, []);

    const offsetedDate = new Date(firstDate);
    offsetedDate.setDate(firstDate.getDate() + offset);

    const maxOffset = Math.max(
        0,
        Math.floor((lastDate - firstDate) / (24 * 60 * 60 * 1000)) - columnCount + 1
    );

    return React.createElement(
        'div',
        {
            key: id,
            className: 'flex gap-2 min-w-full h-64'
        },
        [
            React.createElement(
                'button',
                {
                    key: `${ id }-back`,
                    onClick: () => setOffset(state => Math.max(state - 1, 0)),
                    className: offset !== 0 ? 'opacity-0' : ''
                },
                [ '<' ]
            ),
            React.createElement(
                'div',
                {
                    key: `${ id }-dates`,
                    className: '*:rounded-xs *:bg-neutral-800 *:hover:bg-neutral-700 dark:*:bg-neutral-700 dark:*:hover:bg-neutral-600 flex items-end justify-stretch gap-0.5 w-full'
                },
                Array.from({ length: columnCount }, (_, index) => {
                    const key = offsetedDate.toISOString().split('T')[ 0 ];
                    const value = values[ key ] ?? 0;
                    offsetedDate.setDate(offsetedDate.getDate() + 1);

                    return React.createElement(
                        'div',
                        {
                            key: `${ id }-dates-${ index }`,
                            style: {
                                height: `${ Math.min(value / max * 100 + 1, 100) }%`,
                                width: '100%'
                            },
                            onClick: () => WP.alert(`Visits on ${ key.replaceAll('-', '.') }: ${ value }`)
                        }
                    );
                }),
            ),
            React.createElement(
                'button',
                {
                    key: `${ id }-forward`,
                    onClick: () => setOffset(state => Math.min(state + 1, maxOffset)),
                    className: offset !== maxOffset ? 'opacity-0' : ''
                },
                [ '>' ]
            )
        ]
    );
};

export default DateChart;