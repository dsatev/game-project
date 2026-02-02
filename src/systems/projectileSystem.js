import * as R from 'ramda';
import { removeEntity } from '../core/esc.js';
import { addGold } from './economySystem.js';

const distance = (pos1, pos2) => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
}


const applyDamage = (world, enemyId, damageAmount) => {
    return R.assoc('entities',
        world.entities.map(entity => {
            if (entity.id === enemyId && entity.components.health) {
                const health = entity.components.health;
                const newHealth = Math.max(0, health.current - damageAmount);
                return {
                    ...entity,
                    components: {
                        ...entity.components,
                        health: {
                            ...health,
                            current: newHealth
                        }
                    }
                };
            }
            return entity;
        }),
        world
    );
};

const calculateDamage = (projectiles, world) => {
    return R.reduce((damageMap, proj) => {
        const projComp = proj.components.projectile;
        const projPos = proj.components.position;
        const target = world.entities.find(e => e.id === projComp.targetId);

        if (!target || !target.components.position || !target.components.health) {
            return damageMap;
        }

        const targetPos = target.components.position;
        const dist = distance(projPos, targetPos);

        if (dist < 5) {
            if (projComp.type === 'aoe') {
                return R.reduce((accDamage, entity) => {
                    if (entity.components.position && entity.components.health) {
                        const d = distance(entity.components.position, targetPos);
                        if (d <= projComp.aoeRadius) {
                            return {
                                ...accDamage,
                                [entity.id]: (accDamage[entity.id] || 0) + projComp.damage
                            };
                        }
                    }
                    return accDamage;
                }, damageMap, world.entities);
            } else {
                return {
                    ...damageMap,
                    [target.id]: (damageMap[target.id] || 0) + projComp.damage
                };
            }
        }

        return damageMap;
    }, {}, projectiles);
};

const updateProjectilePosition = (world, proj) => {
    const projComp = proj.components.projectile;
    const projPos = proj.components.position;
    const target = world.entities.find(e => e.id === projComp.targetId);

    if (!target || !target.components.position) {
        return { world, isAlive: false };
    }

    const targetPos = target.components.position;
    const dist = distance(projPos, targetPos);

    if (dist < 5) {
        return { world, isAlive: false };
    }

    const dx = targetPos.x - projPos.x;
    const dy = targetPos.y - projPos.y;
    const moveX = (dx / dist) * projComp.speed;
    const moveY = (dy / dist) * projComp.speed;

    const updatedWorld = R.assoc('entities',
        world.entities.map(entity => {
            if (entity.id === proj.id) {
                return {
                    ...entity,
                    components: {
                        ...entity.components,
                        position: {
                            x: projPos.x + moveX,
                            y: projPos.y + moveY
                        }
                    }
                };
            }
            return entity;
        }),
        world
    );

    return { world: updatedWorld, isAlive: true };
};

export const projectileSystem = (world) => {
    if (!world || !world.entities) return world;

    const projectiles = world.entities.filter(e => e.components.projectile && e.components.position);

    const updateResult = R.reduce((acc, proj) => {
        const result = updateProjectilePosition(acc.world, proj);
        return {
            world: result.world,
            deadProjectiles: result.isAlive ? acc.deadProjectiles : [...acc.deadProjectiles, proj.id]
        };
    }, { world, deadProjectiles: [] }, projectiles);

    let newWorld = updateResult.world;
    const deadProjectiles = updateResult.deadProjectiles;

    const damageMap = calculateDamage(projectiles, newWorld);

    newWorld = R.reduce((acc, key) => {
        return applyDamage(acc, parseInt(key), damageMap[key]);
    }, newWorld, Object.keys(damageMap));

    newWorld = R.reduce((acc, projId) => removeEntity(projId, acc), newWorld, deadProjectiles);

    const deadEnemies = newWorld.entities.filter(e => 
        e.components.health && e.components.health.current <= 0 && e.components.enemy
    );

    newWorld = R.reduce((acc, enemy) => {
        const reward = enemy.components.enemy.reward;
        const worldWithGold = addGold(reward, acc);
        return removeEntity(enemy.id, worldWithGold);
    }, newWorld, deadEnemies);

    const offscreenProjectiles = newWorld.entities.filter(e => {
        if (!e.components.projectile || !e.components.position) return false;
        const pos = e.components.position;
        return pos.x < -100 || pos.x > 900 || pos.y < -100 || pos.y > 700;
    });

    newWorld = R.reduce((acc, proj) => removeEntity(proj.id, acc), newWorld, offscreenProjectiles);

    return newWorld;
};