import * as R from 'ramda';

export const movementSystem = (world) => {
    if (!world || !world.entities) return world;

    const updatedEntities = world.entities.map(entity => {
        if (!entity.components.enemy || !entity.components.position || !entity.components.path) {
            return entity;
        }

        const pos = entity.components.position;
        const path = entity.components.path;
        const enemy = entity.components.enemy;

        if (!path.waypoints || path.waypoints.length === 0 || path.currentWaypointIndex >= path.waypoints.length) {
            return {
                ...entity,
                components: {
                    ...entity.components,
                    reachedEnd: true
                }
            };
        }

        const target = path.waypoints[path.currentWaypointIndex];

        if (!target || typeof target.x === 'undefined' || typeof target.y === 'undefined') {
            return entity;
        }
        const dx = target.x - pos.x;
        const dy = target.y - pos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 5) {
            return {
                ...entity,
                components: {
                    ...entity.components,
                    path: {
                        ...path,
                        currentWaypointIndex: path.currentWaypointIndex + 1
                    }
                }
            };
        }   

        const moveX = (dx / distance) * enemy.speed;
        const moveY = (dy / distance) * enemy.speed;

        return {
            ...entity,
            components: {
                ...entity.components,
                position: {
                    ...pos,
                    x: pos.x + moveX,
                    y: pos.y + moveY
                }
            }
        };
    });
    return {
        ...world,
        entities: updatedEntities
    };
};