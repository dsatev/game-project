import { removeEntity } from '../core/esc.js';
import { addGold } from './economySystem.js';

const distance = (pos1, pos2) => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export const projectileSystem = (world) => {
    if (!world || !world.entities) return world;

    let newWorld = world;
    const projectilesToRemove = [];
    const enemyDamage = {};

    const projectiles = world.entities.filter(e => e.components.projectile && e.components.position);

    projectiles.forEach(proj => {
        const projComp = proj.components.projectile;
        const projPos = proj.components.position;

        const target= world.entities.find(e => e.id === projComp.targetId);

        if (!target || !target.components.position || !target.components.health) {
            projectilesToRemove.push(proj.id);
            return;
        }

        const targetPos = target.components.position;
        const dist = distance(projPos, targetPos);

        if(dist < 10) {
            enemyDamage[target.id] = (enemyDamage[target.id] || 0) + projComp.damage;
            projectilesToRemove.push(proj.id);
            return;
        }

        const dx = targetPos.x - projPos.x;
        const dy = targetPos.y - projPos.y;
        const moveX = (dx / dist) * projComp.speed;
        const moveY = (dy / dist) * projComp.speed;

        newWorld = {
            ...newWorld,
            entities: newWorld.entities.map(entity => {
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
            })
        };
    });

    newWorld = {
        ...newWorld,
        entities: newWorld.entities.map(entity => {
            if (enemyDamage[entity.id]) {
                const health = entity.components.health;
                const newHealth = Math.max(0, health.current - enemyDamage[entity.id]);
                return {
                    ...entity,  
                    components: {
                        ...entity.components,
                        health: {
                            ...health,
                            current: newHealth
                        },
                        dead: newHealth < 0
                    }
                };
            }
            return entity;
        })
    };

    projectilesToRemove.forEach(projId => {
        newWorld = removeEntity(projId, newWorld);
    });

    const deadEnemies = newWorld.entities.filter(e => 
        e.components.health && e.components.health.current <= 0
    );
    deadEnemies.forEach(enemy => {
        const reward = enemy.components.enemy.reward;
        addGold(reward);
        newWorld = removeEntity(enemy.id, newWorld);
    });

    return newWorld;
}