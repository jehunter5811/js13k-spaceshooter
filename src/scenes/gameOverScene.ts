import { createScene } from "./scene";
import { createText } from "../text";
import Game from "../game";

export default function createGameOverScene() {
  let scene = createScene({ update });

  // TODO: we may be able to extract this into some common
  // text based scene
  let titleText = createText("GAME OVER", { x: 100, y: 250 }, undefined, {
    size: 48
  });
  scene.addSprite(titleText);

  let startText = createText("Press ENTER to play again", { x: 200, y: 300 });
  scene.addSprite(startText);

  return scene;

  function update() {
    if (kontra.keys.pressed("enter")) {
      Game.instance().goToOpenScene();
    }
  }
}
