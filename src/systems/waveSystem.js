import { createEntity, addComponent } from "../core/esc";
import { Path, Position, Health, Enemy, Renderable } from "../components/index.js";
import { ENEMY_TYPES } from "../game/config.js";

const WAVES = [
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

let currentWaveIndex = 0;
let waveInProgress = false;
let spawnQueue = [];
let nextSpawnTime = 0;

const prepareWave = (waveIndex) => {
    const wave = WAVES[waveIndex];
    if (!wave) return [];

    const queue = [];
    wave.forEach(group => {
        for (let i = 0; i < group.count; i++) {
            queue.push({
                type: group.type,
                spawnTime: i * group.interval
            });
        }
    });
    return queue.sort((a, b) => a.spawnTime - b.spawnTime) ;
}

const spawnEnemy = (world, type, pathWaypoints) => {
    const config = ENEMY_TYPES[type];
    const startPos = pathWaypoints[0];

    let newWorld = createEntity(world);
    const entityId = newWorld.nextEntityId - 1;

    newWorld = addComponent(entityId, 'position', Position(startPos.x, startPos.y), newWorld);
    newWorld = addComponent(entityId, 'health', Health(config.health, config.health), newWorld);
    newWorld = addComponent(entityId, 'enemy', Enemy(config.speed, config.reward), newWorld);
    newWorld = addComponent(entityId, 'path', Path(pathWaypoints), newWorld);
    newWorld = addComponent(entityId, 'renderable', Renderable('circle', config.color, config.size), newWorld);

    return newWorld;
}   

export const waveSystem = (world, pathWaypoints) => {
    if (!world || !world.entities) return world;

    if(!waveInProgress && spawnQueue.length === 0) {
        if(currentWaveIndex >= WAVES.length) {
            return world;
        }

        spawnQueue = prepareWave(currentWaveIndex);
        waveInProgress = true;
        nextSpawnTime = world.time || 0;
        currentWaveIndex++;
    }

    let newWorld = world;

    while(spawnQueue.length > 0 && world.time >= nextSpawnTime){
        const next = spawnQueue.shift();
        newWorld = spawnEnemy(newWorld, next.type, pathWaypoints);

        if(spawnQueue.length > 0) {
            nextSpawnTime = world.time + (spawnQueue[0].spawnTime - next.spawnTime);
        }
    }

    if (waveInProgress && spawnQueue.length === 0) {
        const remainingEnemies = newWorld.entities.filter(e => e.components.enemy).length;

        if (remainingEnemies === 0) {
            waveInProgress = false;

            nextSpawnTime = world.time + 5000;
        }
    }

    return newWorld;
}

export const startWave = () => {
    currentWaveIndex = 0;
    waveInProgress = false;
    spawnQueue = [];
}

export const resetWaves = () => {
    currentWaveIndex = 0;
    waveInProgress = false;
    spawnQueue = [];
    nextSpawnTime = 0;
    console.log('🔄 Wave system reset');
}

export const getWaveInfo = () => ({
    currentWaveIndex,
    waveInProgress,
    totalWaves: WAVES.length,
    remainingInQueue: spawnQueue.length
});