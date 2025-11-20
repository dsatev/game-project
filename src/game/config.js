export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const ENEMY_TYPES = {
    BASIC:{
        speed: 1,
        health: 100,
        reward: 10,
        color: '#ff4444',
        size: 10
    },
    FAST:{
        speed: 2,
        health: 50,
        reward: 15,
        color: '#44ff44',
        size: 8
    },
    TANK:{
        speed: 0.5,
        health: 200,
        reward: 25,
        color: '#4444ff',
        size: 12
    }
}

export const TOWER_TYPES = {
    BASIC:{
        range: 100,
        damage: 30,
        rateOfFire: 1000,
        cost: 50
    },
    SNIPER:{
        range: 300,
        damage: 80,
        rateOfFire: 2000,
        cost: 120
    },
    AOE:{
        range: 200,
        damage: 30,
        rateOfFire: 1500,
        cost: 80
    }
}

export const PATH_WAYPOINTS = [
    {x: 0, y: 300},
    {x: 200, y: 300},
    {x: 200, y: 100},
    {x: 600, y: 100},
    {x: 600, y: 500},
    {x: 800, y: 500}
];