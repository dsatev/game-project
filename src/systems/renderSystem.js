import { queryEntities } from '../core/esc.js';

let canvas, ctx;

export const initRenderSystem = (canvasElement) => {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
};

export const renderSystem = (world) => {

    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const renderableEntities = queryEntities(['position', 'renderable'], world);

    renderPath(world);

    renderableEntities.forEach(entity => {
        const position = entity.components.position;
        const renderable = entity.components.renderable;

        ctx.fillStyle = renderable.color;

        if (renderable.type === 'circle') {
            ctx.beginPath();
            ctx.arc(position.x, position.y, renderable.size, 0, Math.PI * 2);
            ctx.fill();
        } else if (renderable.type === 'rectangle') {
            ctx.fillRect(position.x - renderable.size / 2, position.y - renderable.size / 2, renderable.size, renderable.size);
        }

        if (entity.components.health) {
            renderHealthBar(position, entity.components.health, renderable.size);
        }
    })

    return world;
}

const renderHealthBar = (position, health, size) => {
    const barWidth = size * 2;
    const barHeight = 5;
    const x = position.x - barWidth / 2;
    const y = position.y - size - 10;

    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, barWidth, barHeight);

    const healthRatio = health.current / health.max;
    ctx.fillStyle = healthRatio > 0.5 ? '#4caf50' : healthRatio > 0.2 ? '#ff9800' : '#f44336';
    ctx.fillRect(x, y, barWidth * healthRatio, barHeight);
}

const renderPath = (world) => {
    const pathEntities = queryEntities(['path'], world)[0];
    if (!pathEntities) return;

    const waypoints = pathEntities.components.path.waypoints;

    ctx.strokeStyle = '#00f';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    waypoints.forEach(point => {
        ctx.lineTo(point.x, point.y);
    });
    ctx.stroke();   
}

