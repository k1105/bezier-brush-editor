"use client";

import type {P5CanvasInstance} from "@p5-wrapper/react";
import {NextReactP5Wrapper} from "@p5-wrapper/next";
import {useCallback, useState} from "react";
import {Vec, CubicPath, Circle} from "@/lib/geometry";
import type p5 from "p5";
import Controls from "../Controls";
import {
  DefaultAnimationStrategy,
  BackAndForthAnimationStrategy,
  AnimationStrategy,
} from "@/lib/animation/AnimationStrategy";
import {useCanvas} from "@/hooks/useCanvas";
import {useAnimation} from "@/hooks/useAnimation";
import {useLayers} from "@/hooks/useLayers";
import {CircleState} from "@/types/types";
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

  const {animationState, updateAnimationState} = useAnimation();

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
      const circles = circleState.circles;
      let hit: {
        path: CubicPath;
        kind: "in" | "out" | "anchor";
        idx: number;
      } | null = null;
      let dragWhole = false;
      let lastMouse: Vec | null = null;
      let selectedCircle = -1;
      let rSlider: p5.Element;
      let p5Mode = "bezier";
      let selectedAnchor: {path: CubicPath; idx: number} | null = null;
      let hoveredAnchor: {path: CubicPath; idx: number} | null = null;
      let currentCircleIndex = 0;
      let isSketchPlaying = false;
      let sketchAnimationSpeed = 1;
      let p5AnimationType = "default";
      let animationStrategy: AnimationStrategy = new DefaultAnimationStrategy();

      // マウス操作
      function isWithinCanvas(x: number, y: number): boolean {
        return x >= 0 && x <= p.width && y >= 0 && y <= p.height;
      }

      function pressBezier() {
        // プレビューモードの場合は何もしない
        if (p5Mode === "preview") {
          return;
        }

        const pt = new Vec(p.mouseX, p.mouseY);

        // キャンバス外の場合は何もしない
        if (!isWithinCanvas(pt.x, pt.y)) {
          return;
        }

        // 現在選択中のレイヤーのパスを取得
        const currentLayerPath =
          canvasState.layers[canvasState.currentLayerIndex].path;

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

      function pressCircle() {
        const pt = new Vec(p.mouseX, p.mouseY);
        for (let i = circles.length - 1; i >= 0; i--) {
          if (circles[i].contains(pt)) {
            selectedCircle = i;
            rSlider.value(circles[i].r);
            rSlider.show();
            return;
          }
        }
        for (const path of [...paths, current]) {
          const idx = path.hitTestAnchor(pt, HIT);
          if (idx !== -1) {
            circles.push(new Circle(path, idx, circleState.defaultRadius));
            return;
          }
        }
        selectedCircle = -1;
        rSlider.hide();
      }

      p.updateWithProps = (props) => {
        p5Mode = props.mode as string;
        isSketchPlaying = props.isPlaying as boolean;
        sketchAnimationSpeed = props.animationSpeed as number;
        if (!isSketchPlaying) {
          currentCircleIndex = 0;
        }
        p5AnimationType = props.animationType as string;
        animationStrategy =
          p5AnimationType === "backAndForth"
            ? new BackAndForthAnimationStrategy()
            : new DefaultAnimationStrategy();

        // レイヤーが切り替わった時にcurrentを更新
        const newLayerIndex = props.currentLayerIndex as number;
        if (newLayerIndex !== canvasState.currentLayerIndex) {
          if (canvasState.layers[newLayerIndex]) {
            current = canvasState.layers[newLayerIndex].path;
            currentPathRef.current = current;
            switchLayer(newLayerIndex);
          } else {
            // 新規レイヤーの場合は新しいパスを作成
            current = new CubicPath();
            currentPathRef.current = current;
            switchLayer(newLayerIndex);
          }
        }
      };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight);
        rSlider = p.createSlider(5, 200, circleState.defaultRadius, 1);
        rSlider.position(10, 50);
        rSlider.style("width", "200px");
        rSlider.hide();
      };

      p.draw = () => {
        p.background(255);

        // レイヤーに基づいてパスを描画
        canvasState.layers.forEach((layer) => {
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
              animationStrategy
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
            animationStrategy
          );

          // 赤い円は常に表示
          if (p5Mode !== "preview") {
            circles.forEach((c, i) => drawCircle(p, c, i === selectedCircle));
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

          if (selectedCircle >= 0) {
            circles[selectedCircle].r = rSlider.value() as number;
            // スライダーの位置を更新
            const circlePos = circles[selectedCircle].pos();
            const sliderWidth = 200; // スライダーの幅
            const offset = 30; // オフセット
            let sliderX = circlePos.x + offset;

            // 右端にはみ出す場合は左側に配置
            if (sliderX + sliderWidth > p.width) {
              sliderX = circlePos.x - offset - sliderWidth;
            }

            rSlider.position(sliderX, circlePos.y - 10);
            rSlider.show();
          } else {
            rSlider.hide();
          }
        }

        p.mousePressed = () => {
          if (p5Mode === "circle") {
            pressCircle();
          } else if (p5Mode === "translate") {
            // TODO: translate mode implementation
          } else {
            pressBezier();
            // パスの変更を反映
            updateCurrentPath(current);
            currentPathRef.current = current;
          }
        };

        p.mouseDragged = () => {
          // プレビューモードの場合は何もしない
          if (p5Mode === "preview") {
            return;
          }

          if (!hit) return;
          if (dragWhole) {
            const d = new Vec(p.mouseX - lastMouse!.x, p.mouseY - lastMouse!.y);
            current.offset.add(d);
            lastMouse = new Vec(p.mouseX, p.mouseY);
            return;
          }

          // キャンバス外への移動を制限
          const newX = Math.max(0, Math.min(p.width, p.mouseX));
          const newY = Math.max(0, Math.min(p.height, p.mouseY));

          // 現在選択中のレイヤーのパスを取得
          const currentLayerPath =
            canvasState.layers[canvasState.currentLayerIndex].path;

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
        };

        p.mouseReleased = () => {
          hit = null;
          dragWhole = false;
        };

        p.keyPressed = () => {
          if (p.keyCode === 32 && hit) {
            dragWhole = true;
            lastMouse = new Vec(p.mouseX, p.mouseY);
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
            addLayerWithLayers();
            current = new CubicPath(); // 新しいパスを作成
            currentPathRef.current = current;
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
      };
    },
    [currentPath, canvasState, circleState]
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
      />
      <div>
        <NextReactP5Wrapper
          sketch={sketch}
          mode={canvasState.mode}
          isPlaying={animationState.isPlaying}
          animationSpeed={animationState.animationSpeed}
          animationType={animationState.animationType}
          currentLayerIndex={canvasState.currentLayerIndex}
        />
      </div>
    </div>
  );
};

export default Sketch;
