import * as R from 'ramda';

export const createWorld = () => ({
    entities: [],
    nextEntityId: 0,
    time: 0,
    deltaTime: 0,
})


export const createEntity = (world, components = {}) => {
    const entity = {
        id: world.nextEntityId,
        components,
    }
    return {
        ...world,
        entities: [...(world.entities || []), entity],
        nextEntityId: world.nextEntityId + 1
    }
}

export const removeEntity = (entityId, world) => ({
    ...world,
    entities: world.entities.filter(e => e.id !== entityId),
})

export const getComponent = R.curry((entityId, componentName, world) => {
    const entity = world.entities.find(e => e.id === entityId);
    return entity?.components[componentName];
})

export const addComponent = R.curry((entityId, componentName, componentData, world) => {
    return {
        ...world,
        entities: world.entities.map(entity => {
            if (entity.id === entityId) {
                return {
                    ...entity,
                    components: {
                        ...entity.components,
                        [componentName]: componentData
                    }
                };
            }
            return entity;
        })
    }
})

export const hasComponent = R.curry((componentName, entity) =>
    componentName in entity.components
)

export const updateComponent = R.curry((entityId, componentName, updater, world) => {
  const updateEntity = (entity) =>
    entity.id === entityId
      ? {
          ...entity,
          components: {
            ...entity.components,
            [componentName]: updater(entity.components[componentName])
          }
        }
      : entity;

  return {
    ...world,
    entities: world.entities.map(updateEntity)
  }
})

export const queryEntities = R.curry((componentNames, world) =>
    world.entities.filter(entity =>
        componentNames.every(name => hasComponent(name, entity))
    )
)

export const runSystems = R.curry((systems, world) =>
    R.pipe(...systems)(world)
)

