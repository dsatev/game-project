export const PATH_WAYPOINTS = [
    {x: 0, y: 300},
    {x: 200, y: 300},
    {x: 200, y: 100},
    {x: 600, y: 100},
    {x: 600, y: 500},
    {x: 800, y: 500}
];

export const WAVES = [
    [
        { type: 'BASIC', count: 5, interval: 1000 },
    ],
    [
        { type: 'BASIC', count: 8, interval: 800 },
        { type: 'FAST', count: 3, interval: 1000 },
    ],
    [
        { type: 'BASIC', count: 10, interval: 600 },
        { type: 'FAST', count: 5, interval: 800 },
        { type: 'TANK', count: 2, interval: 2000 },
    ],
    [
        { type: 'TANK', count: 5, interval: 1000 },
        { type: 'FAST', count: 20, interval: 400 },
    ]
];