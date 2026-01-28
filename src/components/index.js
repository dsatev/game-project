export const Position = (x, y) => ({x, y})

export const Health = (current, max) => ({current, max})

export const Renderable = (type, color, size) => ({type, color, size})

export const Enemy = (speed, reward) => ({speed, reward})

export const Tower = (type, range, damage, rateOfFire, lastFired = 0) => ({type,range, damage, rateOfFire, lastFired})

export const Projectile = (type, speed, damage, targetId, aoeRadius) => ({type, speed, damage, targetId, aoeRadius})

export const Path = (waypoints, currentWaypointIndex = 0) => ({waypoints, currentWaypointIndex})

export const UIElement = (type, data) => ({ type, data })
