import PieChart from 'plugins/Basic_Telemetry/PieChart.js';
import DateChart from 'plugins/Basic_Telemetry/DateChart.js';

export const pages = [
    {
        Component: () => {
            const [ browsers, setBrowsers ] = React.useState(undefined);
            const id = React.useId();
            
            React.useEffect(() => {
                WP.collections.readDocuments('telemetry').then(response => {
                    if (!response.success) setBrowsers(response.reason);

                    let buckets = {
                        browser: {},
                        platform: {},
                        timeVisited: {}
                    };

                    response.value.forEach(({ browser, platform, timeVisited }) => {
                        if (!browser || !platform || !timeVisited) return;
                        if (buckets.browser[ browser ] === undefined)
                            buckets.browser[ browser ] = 0;
                        buckets.browser[ browser ]++;

                        if (buckets.platform[ platform ] === undefined)
                            buckets.platform[ platform ] = 0;
                        buckets.platform[ platform ]++;

                        const date =
                            new Date(timeVisited)
                                .toISOString()
                                .split('T')[ 0 ];

                        if (buckets.timeVisited[ date ] === undefined)
                            buckets.timeVisited[ date ] = 0;
                        buckets.timeVisited[ date ]++;
                    });

                    setBrowsers(buckets);
                });
            }, []);

            if (browsers === undefined)
                return 'loading';

            if (browsers === null)
                return 'error';

            return React.createElement(
                'div',
                {
                    className: 'p-8 flex gap-8 flex-wrap justify-center',
                    key: id
                },
                [
                    React.createElement(
                        PieChart,
                        { values: browsers.browser, key: id + 'FUCK' }
                    ),
                    React.createElement(
                        PieChart,
                        { values: browsers.platform, key: id + 'MY' }
                    ),
                    React.createElement(
                        DateChart,
                        { values: browsers.timeVisited, key: id + 'LIFE' }
                    )
                ]
            );
        },
        name: 'Telemetry',
        showSidebar: true
    }
];

const deduceUA = (ua) => {
    let browser = 'Unknown';
    let platform = 'Unknown';

    browserDetectionLoop: for (const chunk of ua.split(' ').reverse())
        if (chunk.includes('/')) {
            [ browser ] = chunk.split('/');
            break browserDetectionLoop;
        };
    
    switch (browser) {
        case 'Safari':
            if (ua.includes('Chrome'))
                browser = 'Chrome';
            break;
        case 'OPR':
        case 'OPT':
            browser = 'Opera';
            break;
        case 'Edg':
        case 'EdgA':
            browser = 'Edge';
            break;
        case 'Mozilla':
            browser = 'Firefox';
            break;
    };

    let knownPlatforms = {
        'Android': 'Android',
        'Win': 'Windows',
        'Mac': 'Macintosh',
        'BSD': 'BSD',
        'Linux': 'Linux'
    };

    let navigatorPlatform = navigator.platform;
    platformDetectionLoop: for (const knownPlatform of Object.keys(knownPlatforms))
        if (navigatorPlatform.includes(knownPlatform)) {
            platform = knownPlatforms[ knownPlatform ];
            break platformDetectionLoop;
        }

    return { browser, platform };
};

const saveTelemetry = () => {
    if (window.location.pathname.startsWith('/admin')) return;

    const ua = deduceUA(navigator.userAgent);
    const timeVisited = Date.now();

    console.log({ ...ua, timeVisited });

    WP.collections.createDocument('telemetry', { ...ua, timeVisited })
        .then((response) =>
            !response.success &&
            console.error('Failed save telemetry: ' + response.reason)
        );
};

export const onLoad = () => saveTelemetry();

export const onInstall = async () => {
    const response = await WP.collections.createCollection('telemetry', [ 'add' ]);
    if (!response.success)
        console.error('Failed to create a `telemetry` collection: ' + response.reason);
};