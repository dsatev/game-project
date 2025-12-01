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
        type:'basic',
        range: 100,
        damage: 30,
        rateOfFire: 1000,
        color: '#44ff44',
        aoeRadius: '10',
        cost: 50
    },
    SNIPER:{
        type: 'sniper',
        range: 300,
        damage: 80,
        rateOfFire: 2000, 
        color: '#4444ff',
        aoeRadius: '10',
        cost: 120
    },
    AOE:{
        type: 'aoe',
        range: 200,
        damage: 15,
        rateOfFire: 1500,
        color: '#ff4444',
        aoeRadius: 80,
        cost: 10
    }
}
export const LEVELS = {
    1: {
        name: "Forest Path",
        pathway: [
            { x: 50, y: 300 },
            { x: 200, y: 250 },
            { x: 350, y: 300 },
            { x: 500, y: 200 },
            { x: 700, y: 300 }
        ],
        waves: [
            { enemyType: 'basic', count: 5, delay: 0, spawnInterval: 1000 },
            { enemyType: 'basic', count: 8, delay: 5000, spawnInterval: 800 },
            { enemyType: 'fast', count: 3, delay: 10000, spawnInterval: 1200 }
        ],
        difficulty: 1
    },
    2: {
        name: "Mountain Route",
        pathway: [
            { x: 100, y: 100 },
            { x: 300, y: 150 },
            { x: 400, y: 400 },
            { x: 600, y: 350 },
            { x: 750, y: 150 }
        ],
        waves: [
            { enemyType: 'basic', count: 10, delay: 0, spawnInterval: 600 },
            { enemyType: 'tank', count: 2, delay: 8000, spawnInterval: 2000 },
            { enemyType: 'fast', count: 6, delay: 12000, spawnInterval: 900 }
        ],
        difficulty: 2
    }
};