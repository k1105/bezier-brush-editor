import p5 from "p5";
import {CubicPath, Circle} from "@/lib/geometry";
import {AnimationStrategy} from "@/lib/animation/AnimationStrategy";

export function drawBlend(
  p: p5,
  path: CubicPath,
  fps: number,
  sketchAnimationSpeed: number,
  isSketchPlaying: boolean,
  currentCircleIndex: number,
  circles: Circle[],
  animationStrategy: AnimationStrategy
) {
  const totalFrames = fps * sketchAnimationSpeed;
  const pointsToShow = isSketchPlaying
    ? Math.min(Math.floor((currentCircleIndex / totalFrames) * 1000), 1000)
    : 1000;

  // アニメーションが停止している場合は、すべての点を表示
  if (!isSketchPlaying) {
    animationStrategy.draw(
      p,
      path,
      circles,
      totalFrames - 1, // 最後のフレームを表示
      totalFrames,
      pointsToShow
    );
  } else {
    animationStrategy.draw(
      p,
      path,
      circles,
      currentCircleIndex,
      totalFrames,
      pointsToShow
    );
  }
}
