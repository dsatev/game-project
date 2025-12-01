import { getPathway, getCurrentWaveConfig } from './levelSystem.js';
import { ENEMY_TYPES } from '../game/config.js';

let waveTimer = 0;
let spawnTimer = 0;
let enemiesToSpawn = 0;

export const waveSystem = (world) => {
    if (!world || !world.entities) return world;

    const waveConfig = getCurrentWaveConfig();
    if (!waveConfig) return world;

    const pathway = getPathway();
    if (pathway.length === 0) return world;

    // Check if wave should start
    if (world.waveStartTime === undefined) {
        world.waveStartTime = Date.now();
    }

    const elapsed = Date.now() - world.waveStartTime;

    // Delay before wave starts
    if (elapsed < waveConfig.delay) {
        return world;
    }

    waveTimer = elapsed - waveConfig.delay;
    spawnTimer += waveTimer;

    let newWorld = world;

    // Spawn enemies based on interval
    while (spawnTimer >= waveConfig.spawnInterval && enemiesToSpawn < waveConfig.count) {
        spawnTimer -= waveConfig.spawnInterval;
        enemiesToSpawn++;

        const enemyConfig = ENEMY_TYPES[waveConfig.enemyType];
        const enemy = {
            id: `enemy-${Date.now()}-${Math.random()}`,
            components: {
                position: { ...pathway[0] },
                velocity: { x: 0, y: 0 },
                enemy: {
                    type: waveConfig.enemyType,
                    waypoint: 1,
                    speed: enemyConfig.speed,
                    reward: enemyConfig.reward
                },
                health: {
                    max: enemyConfig.health,
                    current: enemyConfig.health
                }
            }
        };

        newWorld = createEntity(enemy, newWorld);
    }

    return newWorld;
};

export const resetWaves = () => {
    waveTimer = 0;
    spawnTimer = 0;
    enemiesToSpawn = 0;
};