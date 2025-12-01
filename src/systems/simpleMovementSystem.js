import { getPathway } from './levelSystem.js';
import { removeEntity } from '../core/esc.js';

const distance = (pos1, pos2) => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
};

export const simpleMovementSystem = (world) => {
    if (!world || !world.entities) return world;

    const pathway = getPathway();
    let newWorld = world;
    const enemiesToRemove = [];

    newWorld = {
        ...newWorld,
        entities: newWorld.entities.map(entity => {
            if (!entity.components.enemy || !entity.components.position) {
                return entity;
            }

            const pos = entity.components.position;
            const enemy = entity.components.enemy;
            const speed = enemy.speed;

            // Get next waypoint
            const nextWaypoint = pathway[enemy.waypoint];
            if (!nextWaypoint) {
                enemiesToRemove.push(entity.id);
                return entity;
            }

            const dist = distance(pos, nextWaypoint);

            // Reached waypoint, move to next
            if (dist < speed) {
                if (enemy.waypoint < pathway.length - 1) {
                    return {
                        ...entity,
                        components: {
                            ...entity.components,
                            enemy: {
                                ...enemy,
                                waypoint: enemy.waypoint + 1
                            }
                        }
                    };
                } else {
                    // Reached end of path
                    enemiesToRemove.push(entity.id);
                    return entity;
                }
            }

            // Move towards waypoint
            const dx = nextWaypoint.x - pos.x;
            const dy = nextWaypoint.y - pos.y;
            const moveX = (dx / dist) * speed;
            const moveY = (dy / dist) * speed;

            return {
                ...entity,
                components: {
                    ...entity.components,
                    position: {
                        x: pos.x + moveX,
                        y: pos.y + moveY
                    }
                }
            };
        })
    };

    enemiesToRemove.forEach(id => {
        newWorld = removeEntity(id, newWorld);
    });

    return newWorld;
};