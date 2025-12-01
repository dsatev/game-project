import { LEVELS } from '../game/config.js';

let currentLevel = 1;
let currentWave = 0;
let levelData = null;

export const initLevel = (levelNumber) => {
    if (!LEVELS[levelNumber]) {
        console.error(`Level ${levelNumber} not found`);
        return false;
    }
    currentLevel = levelNumber;
    currentWave = 0;
    levelData = LEVELS[levelNumber];
    return true;
};

export const getCurrentLevel = () => currentLevel;
export const getLevelData = () => levelData;
export const getCurrentWave = () => currentWave;
export const getPathway = () => levelData?.pathway || [];

export const nextWave = () => {
    if (currentWave < levelData.waves.length - 1) {
        currentWave++;
        return true;
    }
    return false; // Level complete
};

export const getCurrentWaveConfig = () => {
    return levelData?.waves[currentWave] || null;
};

export const isLevelComplete = () => {
    return currentWave >= levelData.waves.length;
};