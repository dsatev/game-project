import { createEntity, addComponent} from '../core/esc.js';
import { Position, Tower, Renderable } from '../components/index.js';
import { spendGold, getGold } from './economySystem.js';
import { TOWER_TYPES } from '../game/config.js';


let selectedTowerType = 'BASIC';
let lastClickPos = null;

export const initInput = (canvas) => {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        lastClickPos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === '1') {
            selectedTowerType = 'BASIC';
        } else if (event.key === '2') {
            selectedTowerType = 'SNIPER';
        } 
    });
};

export const inputSystem = (world) => {
    if (!lastClickPos) return world;

    const { x, y } = lastClickPos;
    lastClickPos = null;

    const towerConfig = TOWER_TYPES[selectedTowerType];


    const canAfford = spendGold(towerConfig.cost);
    console.log('   Can afford:', canAfford);

    if (!canAfford) {
        return world; 
    }


    let newWorld = createEntity(world);
    const entityId = newWorld.nextEntityId - 1;

    newWorld = addComponent(entityId, 'position', Position(x, y), newWorld);
    newWorld = addComponent(entityId, 'tower', Tower(towerConfig.range, towerConfig.damage, towerConfig.rateOfFire), newWorld);
    newWorld = addComponent(entityId, 'renderable', Renderable('rectangle', '#8888ff', 15), newWorld);

    return newWorld;
};

export const getSelectedTowerType = () => selectedTowerType;

export const setSelectedTowerType = (type) => {
    selectedTowerType = type;
};