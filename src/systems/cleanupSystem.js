import { removeEntity } from "../core/esc";
import { loseLife } from "./economySystem.js";

let gameOver = false;

export const cleanupSystem = (world) => {
    if (!world || !world.entities) return world;

    let newWorld = world;

    const escapedEnemies = newWorld.entities.filter(e => {
        return e.components.enemy &&
        e.components.position &&
        e.components.path &&
        e.components.path.currentWaypointIndex >= e.components.path.waypoints.length;
    });

    escapedEnemies.forEach(enemy => {
        newWorld = removeEntity(enemy.id, newWorld);

        const isGameOver = loseLife();
        if (isGameOver) {
            gameOver = true;
        }
    });
    
    const offscreenProjectiles = world.entities.filter(e => {
        if (!e.components.projectile || !e.components.position) return false;
        const pos = e.components.position;
        return pos.x < -100 || pos.x > 900 || pos.y < -100 || pos.y > 700;
    });

    offscreenProjectiles.forEach(proj => {
        newWorld = removeEntity(proj.id, newWorld);
    });
    return newWorld;
}

export const resetGameOver = () => {gameOver = false;}

export const isGameOver = () => gameOver;