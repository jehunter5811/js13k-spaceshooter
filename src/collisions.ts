import Scene from "./scene";
import { createAsteroid, Asteroid } from "./asteroid";
import { Position, getValueInRange, Sprite } from "./utils";
import Config from "./config";
import { createParticle, createExplosionParticle } from "./particles";
import createCell, { CellType } from "./cell";

export default class CollisionsEngine {
  constructor(private scene: Scene) {}

  processCollisions() {
    let scene = this.scene;
    // temporary hack to test something
    let collidableObjects = scene.sprites
      .filter(s => Config.collidableTypes.includes(s.type))
      // with the current algorithm that
      // checks whether an asteroid has collided with X
      // we need to put all the asteroids first, otherwise
      // we won't calculate the collision of an asteroid with
      // the ship (this was a BUG that it took me a lot to find)
      // TODO: improve collision algorithm so that it doesn't
      // require sorting (we could use types to match to specific functions
      // and do one pass)
      .sort((a: Sprite, b: Sprite) => (a.type > b.type ? 1 : -1));

    // collision detection
    for (let i = 0; i < collidableObjects.length; i++) {
      // only check for collision against asteroids
      if (collidableObjects[i].type === "asteroid") {
        for (let j = i + 1; j < collidableObjects.length; j++) {
          // don't check asteroid vs. asteroid collisions
          if (collidableObjects[j].type !== "asteroid") {
            let asteroid = collidableObjects[i];
            let sprite = collidableObjects[j];
            // circle vs. circle collision detection
            let dx = asteroid.x - sprite.x;
            let dy = asteroid.y - sprite.y;
            if (Math.sqrt(dx * dx + dy * dy) < asteroid.radius + sprite.width) {
              asteroid.ttl = 0;

              if (sprite.type === "ship") {
                let ship = sprite;
                if (Config.debug)
                  console.log("Asteroid collided with ship", asteroid, ship);
                // the damage produced in the ship depends
                // on the size of the asteroid
                let damage = asteroid.radius * 4;
                if (ship.shield.get() > 0) {
                  ship.shield.damage(damage);
                  if (ship.shield.get() <= 0) {
                    // do some remaining damage to ship but less
                    ship.life.damage(damage / 4);
                  }
                } else {
                  ship.life.damage(damage);
                }
                if (ship.life.get() <= 0) {
                  if (Config.debug) console.log("SHIP DIED");
                  ship.ttl = 0; // game over mothafucka!
                }
              } else {
                sprite.ttl = 0;
              }

              // explosion
              // particle explosion
              this.addExplosion(scene, asteroid);

              // split the asteroid only if it's large enough
              if (asteroid.radius > 10) {
                breakAsteroidInSmallerOnes(asteroid, scene);
              }

              this.releaseEnergy(scene, asteroid);

              // what the heck is this break doing here?
              // if this object has already collided with another object
              // then there's no need to check more (since the item will be destroyed)
              break;
            }
          }
        }
      }
    }
  }

  addExplosion(scene: Scene, asteroid: Asteroid) {
    // TODO: extract colors and selection
    // to a helper function
    let red = { r: 255, g: 0, b: 0 };
    let orange = { r: 255, g: 165, b: 0 };
    let yellow = { r: 255, g: 255, b: 0 };
    let explosionColors = [red, orange, yellow];
    for (let i = 0; i < asteroid.radius * 10; i++) {
      let colorIndex = Math.round(Math.random() * 2);
      let particle = createExplosionParticle(asteroid, scene.cameraPosition, {
        ttl: 50,
        color: explosionColors[colorIndex],
        magnitude: asteroid.radius / 2
      });
      scene.sprites.push(particle);
    }
  }

  releaseEnergy(scene: Scene, asteroid: Asteroid) {
    let numberOfEnergyCells = Math.round(getValueInRange(1, 3));
    // TODO: Extract all for loops into function that generate
    // n number of sprites and add them to the scene
    // using a factory function
    // Energy Cells
    for (let i = 0; i < numberOfEnergyCells; i++) {
      let newCell = createCell(asteroid, scene.cameraPosition, CellType.Energy);
      scene.sprites.push(newCell);
    }

    //Life Cells
    let numerOfLifeCells = Math.round(getValueInRange(0, 1));
    for (let i = 0; i < numerOfLifeCells; i++) {
      let newCell = createCell(asteroid, scene.cameraPosition, CellType.Life);
      scene.sprites.push(newCell);
    }
  }
}

function breakAsteroidInSmallerOnes(asteroid: any, scene: Scene) {
  if (Config.debug)
    console.log("Asteroid destroyed. Creating smaller asteroids", asteroid);

  for (let i = 0; i < 3; i++) {
    let newAsteroid = createAsteroid(
      asteroid,
      { dx: getValueInRange(-2, 2), dy: getValueInRange(-2, 2) },
      asteroid.radius / 2.5,
      scene.cameraPosition
    );
    scene.sprites.push(newAsteroid);
    if (Config.debug) console.log("New Asteroid", newAsteroid);
  }
}
