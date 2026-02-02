import * as R from 'ramda';
import { createEntity, addComponent } from "../core/esc.js";
import { Path, Position, Health, Enemy, Renderable } from "../components/index.js";
import { ENEMY_TYPES } from "../game/config.js";
import { setGameOver } from "./cleanupSystem.js";
import { getLives } from "./economySystem.js";

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

export const initWaveState = () => ({
    currentWaveIndex: 0,
    waveInProgress: false,
    spawnQueue: [],
    nextSpawnTime: 0,
    waveStartTime: 0
});

const prepareWave = (waveIndex) => {
    const wave = WAVES[waveIndex];
    if (!wave) return [];

    const queue = R.pipe(
        R.map(group => 
            R.range(0, group.count).map(i => ({
                type: group.type,
                spawnTime: i * group.interval
            }))
        ),
        R.flatten,
        R.sortBy(item => item.spawnTime)
    )(wave);
    
    return queue;
};

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
};

export const getWaveInfo = (world) => ({
    currentWaveIndex: world.waveState?.currentWaveIndex ?? 0,
    waveInProgress: world.waveState?.waveInProgress ?? false,
    totalWaves: WAVES.length,
    remainingInQueue: (world.waveState?.spawnQueue ?? []).length
});

const updateWaveState = R.curry((updates, world) => {
    return R.assoc('waveState',
        { ...world.waveState || initWaveState(), ...updates },
        world
    );
});

const startNewWave = (world) => {
    const waveState = world.waveState || initWaveState();
    
    if (waveState.currentWaveIndex >= WAVES.length) {
        // All waves completed, check if victory or defeat
        if (getLives(world) > 0) {
            console.log('VICTORY! All waves completed!');
            return setGameOver(world);
        }
        return world;
    }

    const spawnQueue = prepareWave(waveState.currentWaveIndex);
    const newWaveStartTime = world.time || 0;
    const newNextSpawnTime = newWaveStartTime + (spawnQueue.length > 0 ? spawnQueue[0].spawnTime : 0);

    return updateWaveState({
        spawnQueue: spawnQueue,
        waveInProgress: true,
        waveStartTime: newWaveStartTime,
        nextSpawnTime: newNextSpawnTime,
        currentWaveIndex: waveState.currentWaveIndex + 1
    }, world);
};

const processSpawnQueue = (world, pathWaypoints) => {
    const waveState = world.waveState || initWaveState();
    
    if (waveState.spawnQueue.length === 0 || (world.time || 0) < waveState.nextSpawnTime) {
        return world;
    }

    const [nextEnemy, ...remainingQueue] = waveState.spawnQueue;
    let newWorld = spawnEnemy(world, nextEnemy.type, pathWaypoints);
    
    const newNextSpawnTime = remainingQueue.length > 0 
        ? (world.time || 0) + (remainingQueue[0].spawnTime - nextEnemy.spawnTime)
        : (world.time || 0);

    return updateWaveState({
        spawnQueue: remainingQueue,
        nextSpawnTime: newNextSpawnTime
    }, newWorld);
};

const checkWaveCompletion = (world) => {
    const waveState = world.waveState || initWaveState();
    
    if (!waveState.waveInProgress || waveState.spawnQueue.length > 0) {
        return world;
    }

    const remainingEnemies = world.entities.filter(e => e.components.enemy).length;

    if (remainingEnemies === 0) {
        return updateWaveState({
            waveInProgress: false,
            nextSpawnTime: (world.time || 0) + 5000
        }, world);
    }

    return world;
};

export const waveSystem = (world, pathWaypoints) => {
    if (!world || !world.entities) return world;

    let newWorld = world;
    const waveState = newWorld.waveState || initWaveState();

    if (!waveState.waveInProgress && waveState.spawnQueue.length === 0) {
        newWorld = startNewWave(newWorld);
    }

    newWorld = processSpawnQueue(newWorld, pathWaypoints);

    newWorld = checkWaveCompletion(newWorld);

    return newWorld;
};

export const resetWaveState = (world) => {
    let newWorld = R.assoc('waveState', initWaveState(), world);
    newWorld = setGameOver(newWorld);
    return newWorld;
};

export const startWave = (world) => {
    const waveState = world.waveState || initWaveState();
    return R.assoc('waveState',
        { ...waveState, waveInProgress: false, spawnQueue: [] },
        world
    );
};