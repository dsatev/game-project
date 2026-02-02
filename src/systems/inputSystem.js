import * as R from 'ramda';
import { createEntity, addComponent} from '../core/esc.js';
import { Position, Tower, Renderable } from '../components/index.js';
import { spendGold, getGold } from './economySystem.js';
import { TOWER_TYPES } from '../game/config.js';

let lastClickPos = null;
let lastKeyPressed = null;


export const initUIState = () => ({
    selectedTowerType: 'BASIC'
})

export const initInput = (canvas) => {
    canvas.addEventListener('click', (event) => {
        const rect = canvas.getBoundingClientRect();
        lastClickPos = {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        }
    })

    window.addEventListener('keydown', (event) => {
        if (['1', '2', '3'].includes(event.key)) {
            lastKeyPressed = event.key;
        }
    })
}


const updateSelectedTowerType = R.curry((world, keyPressed) => {
    const typeMap = { '1': 'BASIC', '2': 'SNIPER', '3': 'AOE' };
    const newType = typeMap[keyPressed];
    if (newType) {
        return R.assoc('uiState',
            R.assoc('selectedTowerType', newType, world.uiState || initUIState()),
            world
        );
    }
    return world;
})


export const getSelectedTowerType = (world) => 
    world.uiState?.selectedTowerType ?? 'BASIC';

export const setSelectedTowerType = R.curry((type, world) => {
    return R.assoc('uiState',
        R.assoc('selectedTowerType', type, world.uiState || initUIState()),
        world
    );
})

export const inputSystem = (world) => {
    let newWorld = world;

    
    if (lastKeyPressed) {
        newWorld = updateSelectedTowerType(newWorld, lastKeyPressed);
        lastKeyPressed = null;
    }

   
    if (!lastClickPos) return newWorld;

    const { x, y } = lastClickPos;
    lastClickPos = null;

    const selectedType = getSelectedTowerType(newWorld);
    const towerConfig = TOWER_TYPES[selectedType];

    
    const spendResult = spendGold(towerConfig.cost, newWorld);
    
    if (!spendResult.success) {
        return spendResult.world;
    }

    
    let towerWorld = spendResult.world;
    towerWorld = createEntity(towerWorld);
    const entityId = towerWorld.nextEntityId - 1;

    towerWorld = addComponent(entityId, 'position', Position(x, y), towerWorld);
    towerWorld = addComponent(entityId, 'tower', Tower(selectedType, towerConfig.range, towerConfig.damage, towerConfig.rateOfFire), towerWorld);
    towerWorld = addComponent(entityId, 'renderable', Renderable('rectangle', towerConfig.color, 15), towerWorld);

    return towerWorld;
}