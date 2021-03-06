import {
  Position,
  getCanvasPosition,
  Velocity,
  degreesToRadians,
  RGB,
  Color
} from "./utils";
import { Scene } from "./scenes/scene";
import { Draw } from "./draw";
import { callTimes } from "./fp";
import { ParticlePools } from "./particles/ParticlePools";
import { ParticleType } from "./particles/Particle";

export interface Bullet extends Sprite {
  damage: number;
  owner: Sprite;
  color: RGB;
}

const numberOfParticles = 2;

export default function createBullet(
  position: Position,
  velocity: Velocity,
  angle: number,
  cameraPosition: Position,
  scene: Scene,
  owner: Sprite,
  damage: number = 10,
  color: RGB = { r: 255, g: 255, b: 255 }
): Bullet {
  let cos = Math.cos(degreesToRadians(angle));
  let sin = Math.sin(degreesToRadians(angle));

  return kontra.sprite({
    type: SpriteType.Bullet,
    // start the bullet at the front of the ship
    x: position.x + cos * 12,
    y: position.y + sin * 12,
    // move the bullet slightly faster than the ship
    // it can happen that the ship is going in the opposite direction
    // than the bullets (in that case the speed of the bullets is smaller with
    // the current implementation)
    dx: velocity.dx + cos * 5,
    dy: velocity.dy + sin * 5,
    // damage can vary based on who shoots the missile
    damage,
    // avoid friendly fire
    owner,
    // live only 50 frames
    // TODO: This should be configurable as range of firing
    ttl: 50,
    // bullets are small
    width: 2,
    height: 2,
    color,
    update() {
      this.advance();
      this.addParticles();
    },
    addParticles() {
      callTimes(numberOfParticles, () =>
        ParticlePools.instance().get(ParticleType.Particle, {
          position: { x: this.x, y: this.y },
          velocity: { dx: this.dx, dy: this.dy },
          cameraPosition,
          angle,
          particleOptions: { color }
        })
      );
    },
    /*
    followNearTarget() {
      // HERE
    },
    */
    render() {
      let position = getCanvasPosition(this, cameraPosition);
      Draw.fillRect(
        this.context,
        position.x,
        position.y,
        this.width,
        this.height,
        Color.rgb(this.color)
      );

      /*
      if (Config.debug && Config.showPath) {
        this.context.save();
        this.context.translate(position.x, position.y);
        Draw.drawLine(this.context, 0, 0, this.dx, this.dy, "red");
        this.context.restore();
      }
      */

      /*
      if (Config.debug && Config.renderCollisionArea) {
        this.context.save();
        this.context.translate(position.x, position.y);
        Draw.drawCircle(this.context, 0, 0, this.width / 2, "red");
        this.context.restore();
      }
      */
    }
  });
}
