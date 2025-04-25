"use client";

import type {P5CanvasInstance} from "@p5-wrapper/react";
import {NextReactP5Wrapper} from "@p5-wrapper/next";
import {useCallback, useState} from "react";
import {Vec, CubicPath, Circle} from "@/lib/geometry";
import Controls from "../Controls";
import {
  DefaultAnimationStrategy,
  AnimationStrategy,
} from "@/lib/animation/AnimationStrategy";
import {useCanvas} from "@/hooks/useCanvas";
import {useAnimation} from "@/hooks/useAnimation";
import {useLayers} from "@/hooks/useLayers";
import {CircleState, Layer} from "@/types/types";
import {drawPath} from "@/components/draw/drawPath";
import {drawCircle} from "@/components/draw/drawCircle";

const Sketch = () => {
  const {
    canvasState,
    currentPath,
    currentPathRef,
    updateCanvasState,
    switchLayer,
    updateCurrentPath,
  } = useCanvas();

  const {animationState, updateAnimationState, getAnimationStrategy} =
    useAnimation();

  const {addLayer: addLayerWithLayers} = useLayers(
    canvasState.layers,
    canvasState.currentLayerIndex,
    (updatedLayers, newIndex) => {
      updateCanvasState({
        layers: updatedLayers,
        currentLayerIndex: newIndex,
      });
    }
  );
  const [circleState] = useState<CircleState>({
    circles: [],
    selectedCircle: -1,
    defaultRadius: 30,
  });

  const sketch = useCallback(
    (p: P5CanvasInstance) => {
      // 設定値
      const HIT = 8;
      const STEP_DRAW = 0.02;
      const FPS = 60; // フレームレート

      // 状態
      const paths: CubicPath[] = [];
      let current = currentPathRef.current;
      // const circles = circleState.circles;
      let circles: Circle[] = [];
      let hit: {
        path: CubicPath;
        kind: "in" | "out" | "anchor";
        idx: number;
      } | null = null;
      let selectedCircle = -1;
      let p5Mode = "bezier";
      let layers: Layer[] = [];
      let selectedAnchor: {path: CubicPath; idx: number} | null = null;
      let hoveredAnchor: {path: CubicPath; idx: number} | null = null;
      let currentCircleIndex = 0;
      let currentLayerIndex = 0;
      let isSketchPlaying = false;
      let sketchAnimationSpeed = 1;
      let p5AnimationType = "default";
      let animationStrategy: AnimationStrategy = new DefaultAnimationStrategy();
      let isDraggingControlPoint = false;
      let previousLayerIndex = 0;

      // マウス操作
      function isWithinCanvas(x: number, y: number): boolean {
        return x >= 0 && x <= p.width && y >= 0 && y <= p.height;
      }

      function pressBezier(currentLayerPath: CubicPath) {
        // プレビューモードの場合は何もしない
        if (p5Mode === "preview") {
          return;
        }

        const pt = new Vec(p.mouseX, p.mouseY);

        // キャンバス外の場合は何もしない
        if (!isWithinCanvas(pt.x, pt.y)) {
          return;
        }

        // アンカーポイントの選択
        for (let i = 0; i < currentLayerPath.anchors.length; i++) {
          if (Vec.dist(currentLayerPath.anchors[i].pos, pt) < 10) {
            selectedAnchor = {path: currentLayerPath, idx: i};
            hit = {path: currentLayerPath, kind: "anchor", idx: i};
            return;
          }
        }

        // ハンドルの選択
        for (let i = 0; i < currentLayerPath.anchors.length; i++) {
          const a = currentLayerPath.anchors[i];
          if (a.in && Vec.dist(a.in, pt) < HIT) {
            hit = {path: currentLayerPath, kind: "in", idx: i};
            return;
          }
          if (a.out && Vec.dist(a.out, pt) < HIT) {
            hit = {path: currentLayerPath, kind: "out", idx: i};
            return;
          }
        }

        // 新規アンカーポイントの追加
        currentLayerPath.addAnchor(pt);
        current = currentLayerPath;
        updateCurrentPath(current);
        currentPathRef.current = current;
      }

      const drawControlPoint = (circle: Circle) => {
        const controlPoint = circle.getControlPoint();
        p.fill(0, 0, 255); // 青い円
        p.noStroke();
        p.circle(controlPoint.x, controlPoint.y, 10);
      };

      p.updateWithProps = (props) => {
        p5Mode = props.mode as string;
        layers = props.layers as Layer[];
        isSketchPlaying = props.isPlaying as boolean;
        sketchAnimationSpeed = props.animationSpeed as number;
        currentCircleIndex = props.currentCircleIndex as number;
        currentLayerIndex = props.currentLayerIndex as number;
        p5AnimationType = props.animationType as string;
        animationStrategy = props.animationStrategy as AnimationStrategy;
        circles = props.circles as Circle[];
        selectedAnchor = props.selectedAnchor as {
          path: CubicPath;
          idx: number;
        } | null;
        hoveredAnchor = props.hoveredAnchor as {
          path: CubicPath;
          idx: number;
        } | null;
        hit = props.hit as {
          path: CubicPath;
          kind: "in" | "out" | "anchor";
          idx: number;
        } | null;

        // レイヤーが切り替わった時にcurrentを更新
        if (currentLayerIndex !== previousLayerIndex) {
          if (layers[currentLayerIndex]) {
            current = layers[currentLayerIndex].path;
            currentPathRef.current = current;
            switchLayer(currentLayerIndex);
          } else {
            // 新規レイヤーの場合は新しいパスを作成
            current = new CubicPath();
            currentPathRef.current = current;
            switchLayer(currentLayerIndex);
          }
          previousLayerIndex = currentLayerIndex;
        }
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
      };

      p.draw = () => {
        p.background(0);

        // レイヤーに基づいてパスを描画
        layers.forEach((layer, index) => {
          if (layer.isVisible) {
            drawPath(
              p,
              layer.path,
              selectedAnchor,
              hoveredAnchor,
              p5Mode,
              STEP_DRAW,
              FPS,
              sketchAnimationSpeed,
              isSketchPlaying,
              currentCircleIndex,
              circles,
              animationStrategy,
              index === currentLayerIndex
            );
          }
        });

        // 現在編集中のパスを描画
        if (current.anchors.length > 0) {
          drawPath(
            p,
            current,
            selectedAnchor,
            hoveredAnchor,
            p5Mode,
            STEP_DRAW,
            FPS,
            sketchAnimationSpeed,
            isSketchPlaying,
            currentCircleIndex,
            circles,
            animationStrategy,
            true
          );

          // 赤い円は常に表示
          if (p5Mode !== "preview") {
            circles.forEach((c, i) => {
              drawCircle(p, c, i === selectedCircle);
              if (i === selectedCircle) {
                drawControlPoint(c);
              }
            });
          }

          // アニメーションフレームの更新
          if (isSketchPlaying) {
            const totalFrames = FPS * sketchAnimationSpeed;
            if (p5AnimationType === "backAndForth") {
              // 往復アニメーションの場合、totalFramesの2倍のフレーム数でループ
              currentCircleIndex = (currentCircleIndex + 1) % (totalFrames * 2);
            } else {
              // 通常のアニメーションの場合、totalFramesでループ
              currentCircleIndex = (currentCircleIndex + 1) % totalFrames;
            }
          }
        }
      };

      p.mousePressed = () => {
        if (p5Mode === "circle") {
          const pt = new Vec(p.mouseX, p.mouseY);

          // コントロールポイントの選択をチェック
          for (let i = circles.length - 1; i >= 0; i--) {
            if (circles[i].containsControlPoint(pt)) {
              selectedCircle = i;
              isDraggingControlPoint = true;
              return;
            }
          }

          // 円の選択をチェック
          for (let i = circles.length - 1; i >= 0; i--) {
            if (circles[i].contains(pt)) {
              selectedCircle = i;
              return;
            }
          }

          // アンカーポイントでの円の作成
          for (const path of [...paths, current]) {
            const idx = path.hitTestAnchor(pt, HIT);
            if (idx !== -1) {
              circles.push(new Circle(path, idx, circleState.defaultRadius));
              selectedCircle = circles.length - 1;
              return;
            }
          }
          selectedCircle = -1;
        } else if (p5Mode === "translate") {
          // TODO: translate mode implementation
        } else {
          pressBezier(current);
        }
      };

      p.mouseDragged = () => {
        if (
          p5Mode === "circle" &&
          selectedCircle >= 0 &&
          isDraggingControlPoint
        ) {
          const pt = new Vec(p.mouseX, p.mouseY);
          circles[selectedCircle].updateRadiusFromControlPoint(pt);
          // 半径の更新を即時反映
          updateCurrentPath(current);
          currentPathRef.current = current;
        } else if (p5Mode !== "preview" && hit) {
          // プレビューモードの場合は何もしない
          if (p5Mode === "preview") {
            return;
          }

          // キャンバス外への移動を制限
          const newX = Math.max(0, Math.min(p.width, p.mouseX));
          const newY = Math.max(0, Math.min(p.height, p.mouseY));

          // 現在選択中のレイヤーのパスを取得
          const currentLayerPath = layers[canvasState.currentLayerIndex].path;

          if (hit.kind === "anchor") {
            const movedX = newX - p.pmouseX;
            const movedY = newY - p.pmouseY;
            currentLayerPath.moveAnchor(hit.idx, new Vec(movedX, movedY));
          } else {
            currentLayerPath.moveHandle(hit.idx, hit.kind, new Vec(newX, newY));
          }

          current = currentLayerPath;
          updateCurrentPath(current);
          currentPathRef.current = current;
        }
      };

      p.mouseReleased = () => {
        isDraggingControlPoint = false;
        if (selectedCircle >= 0) {
          // リリース時にも半径の更新を反映
          updateCurrentPath(current);
          currentPathRef.current = current;
        }
        updateCanvasState({
          hit: null,
          dragWhole: false,
          lastMouse: null,
        });
      };

      p.keyPressed = () => {
        if (p.keyCode === 32 && hit) {
          updateCanvasState({
            dragWhole: true,
            lastMouse: new Vec(p.mouseX, p.mouseY),
          });
          return;
        } // SPACE

        // モード切り替えショートカット
        if (p.key === "c") {
          updateCanvasState({mode: "circle"});
          return;
        }
        if (p.key === "v") {
          updateCanvasState({mode: "bezier"});
          return;
        }
        if (p.key === "p") {
          updateCanvasState({mode: "preview"});
          return;
        }
        if (p.key === "t") {
          updateCanvasState({mode: "translate"});
          return;
        }

        // アンカーポイントの削除
        if (p.keyCode === p.BACKSPACE && selectedAnchor) {
          const {path, idx} = selectedAnchor;
          path.removeAnchor(idx);
          selectedAnchor = null;
          hit = null;
          updateCurrentPath(current);
          return;
        }

        if (
          p.keyCode === p.ENTER &&
          p5Mode === "bezier" &&
          current.anchors.length > 1
        ) {
          // 現在のレイヤーのパスを確定
          updateCurrentPath(current);
          // 新しいレイヤーを作成
          const newPath = new CubicPath();
          current = newPath;
          currentPathRef.current = newPath;
          updateCurrentPath(newPath);
          // レイヤーを追加
          addLayerWithLayers();
        }
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };

      p.mouseMoved = () => {
        const pt = new Vec(p.mouseX, p.mouseY);
        hoveredAnchor = null;

        for (const path of [...paths, current]) {
          for (let i = 0; i < path.anchors.length; i++) {
            if (Vec.dist(path.anchors[i].pos, pt) < 10) {
              hoveredAnchor = {path, idx: i};
              return;
            }
          }
        }
      };
    },
    [currentPath]
  );

  return (
    <div style={{width: "100vw", height: "100vh", position: "relative"}}>
      <Controls
        mode={canvasState.mode}
        setMode={(mode) => updateCanvasState({mode})}
        isPlaying={animationState.isPlaying}
        setIsPlaying={(isPlaying) => updateAnimationState({isPlaying})}
        animationSpeed={animationState.animationSpeed}
        setAnimationSpeed={(animationSpeed) =>
          updateAnimationState({animationSpeed})
        }
        animationType={animationState.animationType}
        setAnimationType={(animationType) =>
          updateAnimationState({animationType})
        }
        layers={canvasState.layers}
        currentLayerIndex={canvasState.currentLayerIndex}
        setCurrentLayerIndex={(currentLayerIndex) =>
          updateCanvasState({currentLayerIndex})
        }
        updateCanvasState={updateCanvasState}
      />
      <div>
        <NextReactP5Wrapper
          sketch={sketch}
          mode={canvasState.mode}
          isPlaying={animationState.isPlaying}
          animationSpeed={animationState.animationSpeed}
          animationType={animationState.animationType}
          currentLayerIndex={canvasState.currentLayerIndex}
          currentCircleIndex={animationState.currentFrame}
          animationStrategy={getAnimationStrategy()}
          selectedAnchor={canvasState.selectedAnchor}
          hoveredAnchor={canvasState.hoveredAnchor}
          hit={canvasState.hit}
          dragWhole={canvasState.dragWhole}
          lastMouse={canvasState.lastMouse}
          circles={circleState.circles}
          layers={canvasState.layers}
        />
      </div>
    </div>
  );
};

export default Sketch;
