import * as R from 'ramda';


export const initEconomyState = () => ({
    gold: 1000,
    lives: 20
});


export const getGold = (world) => world.economyState?.gold ?? 1000;
export const getLives = (world) => world.economyState?.lives ?? 20;


export const addGold = R.curry((amount, world) => {
    const newGold = (world.economyState?.gold ?? 0) + amount;
    return R.assoc('economyState', 
        R.assoc('gold', newGold, world.economyState || initEconomyState()),
        world
    );
});

export const spendGold = R.curry((amount, world) => {
    const currentGold = world.economyState?.gold ?? 0;
    if (currentGold >= amount) {
        const newGold = currentGold - amount;
        return {
            success: true,
            world: R.assoc('economyState',
                R.assoc('gold', newGold, world.economyState || initEconomyState()),
                world
            )
        };
    }
    return { success: false, world };
});

export const loseLife = R.curry((amount, world) => {
    const currentLives = world.economyState?.lives ?? 20;
    const newLives = Math.max(0, currentLives - amount);
    const isGameOver = newLives <= 0;
    
    return {
        isGameOver,
        world: R.assoc('economyState',
            R.assoc('lives', newLives, world.economyState || initEconomyState()),
            world
        )
    };
});

export const resetEconomyState = (world) => {
    return R.assoc('economyState', initEconomyState(), world);
};
