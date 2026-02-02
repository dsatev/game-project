import * as R from 'ramda';
import { removeEntity } from "../core/esc";
import { loseLife } from "./economySystem.js";

export const initGameState = () => ({
    isGameOver: false
});

export const isGameOver = (world) => world.gameState?.isGameOver ?? false;


export const setGameOver = (world) => {
    return R.assoc('gameState',
        R.assoc('isGameOver', true, world.gameState || initGameState()),
        world
    );
};

export const resetGameOver = (world) => {
    return R.assoc('gameState',
        R.assoc('isGameOver', false, world.gameState || initGameState()),
        world
    );
};


const hasReachedEnd = (entity) => {
    return entity.components.enemy &&
        entity.components.position &&
        entity.components.path &&
        entity.components.path.currentWaypointIndex >= entity.components.path.waypoints.length;
};


const isOffscreen = (entity) => {
    if (!entity.components.projectile || !entity.components.position) return false;
    const pos = entity.components.position;
    return pos.x < -100 || pos.x > 800 || pos.y < -100 || pos.y > 600;
};


const handleEscapedEnemies = (world) => {
    const escapedEnemies = world.entities.filter(hasReachedEnd);
    
    return escapedEnemies.reduce((accWorld, enemy) => {
        
        let newWorld = removeEntity(enemy.id, accWorld);
        
        
        const loseLifeResult = loseLife(1, newWorld);
        newWorld = loseLifeResult.world;
        
        
        if (loseLifeResult.isGameOver) {
            newWorld = setGameOver(newWorld);
        }
        
        return newWorld;
    }, world);
};


const handleOffscreenProjectiles = (world) => {
    const offscreenProjectiles = world.entities.filter(isOffscreen);
    
    return offscreenProjectiles.reduce((accWorld, proj) => 
        removeEntity(proj.id, accWorld)
    , world);
};

export const cleanupSystem = (world) => {
    if (!world || !world.entities) return world;

    
    return R.pipe(
        handleEscapedEnemies,
        handleOffscreenProjectiles
    )(world);
};