let gold = 100;
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
        lives = 0; // Don't go negative
        return true; // Game over
    }
    return false;
};

export const resetEconomy = () => {
    gold = 100;
    lives = 20;
};

export const economySystem = (world) => {
    if (!world || !world.entities) return world;

    return world;
}