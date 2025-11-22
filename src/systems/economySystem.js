let gold = 1000;
let lives = 20;

export const getGold = () => gold;
export const getLives = () => lives;

export const addGold = (amount) => {
    gold += amount;
};


export const spendGold = (amount) => {
    if (gold >= amount) {
        gold -= amount;
        return true;
    }
    return false;   
};

export const loseLife = (amount = 1) => {
    lives -= amount;

    if (lives <= 0) {
        lives = 0; 
        return true; 
    }
    return false;
};

export const resetEconomy = () => {
    gold = 1000;
    lives = 20;
};

export const economySystem = (world) => {
    if (!world || !world.entities) return world;

    return world;
}