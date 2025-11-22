import { createEntity, addComponent, queryEntities } from '../core/esc.js';
import { Position, Projectile, Renderable} from '../components/index.js';
import { selectedTowerType } from './inputSystem.js';
import { TOWER_TYPES } from '../game/config.js';

const distance = (pos1, pos2) => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

const findClosestEnemy = (towerPos, range, enemies) => {
    return enemies
        .map(enemy => ({
            enemy,
            dist: distance(towerPos, enemy.components.position)
        }))
        .filter(({ dist }) => dist <= range)
        .sort((a, b) => a.dist - b.dist)[0]?.enemy || null;
}

export const towerSystem = (world) => {
    if (!world || !world.entities) return world;

    const towers = queryEntities(['tower', 'position'], world);
    const enemies = queryEntities(['enemy', 'position', 'health'], world);

    let newWorld = world;

    towers.forEach(tower => {
        const towerComp = tower.components.tower;
        const towerPos = tower.components.position;
        const towerConfig = TOWER_TYPES[selectedTowerType];3


        const timeSinceLastShot = (newWorld.time || 0) - (towerComp.lastFired || 0);
        if (timeSinceLastShot < towerComp.rateOfFire) {
            return;
        }

        const target = findClosestEnemy(towerPos, towerComp.range, enemies);
        if (!target) return;

        newWorld = createEntity(newWorld);
        const projectileId = newWorld.nextEntityId - 1;

        newWorld = addComponent(projectileId, 'position', Position(towerPos.x, towerPos.y), newWorld);
        newWorld = addComponent(projectileId, 'projectile', Projectile(5, towerComp.damage, target.id, towerConfig.aoeRadius), newWorld);
        newWorld = addComponent(projectileId, 'renderable', Renderable('circle', towerComp.projColor, 4), newWorld);

        const updatedEntities = newWorld.entities.map(entity => {
            if (entity.id === tower.id) {
                return {
                    ...entity,
                    components: {
                        ...entity.components,
                        tower: {
                            ...towerComp,
                            lastFired: world.time
                        }
                    }
                };
            }
            return entity;
        });

        newWorld = {
            ...newWorld,
            entities: updatedEntities
        };
    });

    return newWorld;
};