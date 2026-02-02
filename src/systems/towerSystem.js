import * as R from 'ramda';
import { createEntity, addComponent, queryEntities } from '../core/esc.js';
import { Position, Projectile, Renderable} from '../components/index.js';
import { TOWER_TYPES } from '../game/config.js';

const distance = (pos1, pos2) => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

const findClosestEnemy = (towerPos, range, enemies) => {
    return R.pipe(
        R.map(enemy => ({
            enemy,
            dist: distance(towerPos, enemy.components.position)
        })),
        R.filter(({ dist }) => dist <= range),
        R.sort((a, b) => a.dist - b.dist),
        R.head,
        R.prop('enemy')
    )(enemies);
};

const fireProjectile = (tower, towerPos, towerComp, towerConfig, target, world) => {
    if (!target) return world;

    let newWorld = createEntity(world);
    const projectileId = newWorld.nextEntityId - 1;

    newWorld = addComponent(projectileId, 'position', Position(towerPos.x, towerPos.y), newWorld);
    newWorld = addComponent(projectileId, 'projectile', 
        Projectile(towerConfig.type, 5, towerComp.damage, target.id, towerConfig.aoeRadius), 
        newWorld);
    newWorld = addComponent(projectileId, 'renderable', Renderable('circle', '#ffffff', 4), newWorld);

    newWorld = R.assoc('entities',
        newWorld.entities.map(entity => {
            if (entity.id === tower.id) {
                return {
                    ...entity,
                    components: {
                        ...entity.components,
                        tower: {
                            ...entity.components.tower,
                            lastFired: world.time
                        }
                    }
                };
            }
            return entity;
        }),
        newWorld
    );

    return newWorld;
};

export const towerSystem = (world) => {
    if (!world || !world.entities) return world;

    const towers = queryEntities(['tower', 'position'], world);
    const enemies = queryEntities(['enemy', 'position', 'health'], world);

    return R.reduce((accWorld, tower) => {
        const towerComp = tower.components.tower;
        const towerPos = tower.components.position;
        const towerConfig = TOWER_TYPES[towerComp.type];

        const timeSinceLastShot = (accWorld.time || 0) - (towerComp.lastFired || 0);

        if (timeSinceLastShot < towerComp.rateOfFire) {
            return accWorld;
        }

        const target = findClosestEnemy(towerPos, towerComp.range, enemies);


        if (!target) {
            return accWorld;
        }

        return fireProjectile(tower, towerPos, towerComp, towerConfig, target, accWorld);
    }, world, towers);
};