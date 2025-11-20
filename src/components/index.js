export const Position = (x, y) => ({x, y});

export const Velocity = (vx, vy) => ({vx, vy});

export const Health = (current, max) => ({current, max});

export const Renderable = (type, color, size) => ({type, color, size});

export const Enemy = (speed, reward) => ({speed, reward});

export const Tower = (range, damage, rateOfFire, lastFired = 0) => ({range, damage, rateOfFire, lastFired});

export const Projectile = (speed, damage, targetId) => ({speed, damage, targetId});

export const Path = (waypoints, currentWaypointIndex = 0) => ({waypoints, currentWaypointIndex});

export const Targetable = () => ({}); 

export const UIElement = (type, data) => ({ type, data });