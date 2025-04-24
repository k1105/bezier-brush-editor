import {useState, useCallback, useRef} from "react";
import {CubicPath} from "@/lib/geometry";
import type {CanvasState, Mode} from "@/types/types";

export const useCanvas = (initialMode: Mode = "bezier") => {
  const [canvasState, setCanvasState] = useState<CanvasState>({
    mode: initialMode,
    currentLayerIndex: 0,
    layers: [{path: new CubicPath(), isVisible: true, name: "Layer 0"}],
    selectedAnchor: null,
    hoveredAnchor: null,
    hit: null,
    dragWhole: false,
    lastMouse: null,
  });

  const currentPathRef = useRef<CubicPath>(canvasState.layers[0].path);
  const [currentPath, setCurrentPath] = useState<CubicPath>(
    currentPathRef.current
  );

  const updateCanvasState = useCallback((updates: Partial<CanvasState>) => {
    setCanvasState((prev) => {
      const newState = {...prev, ...updates};
      // レイヤーが更新された場合、currentPathRefも更新
      if (updates.layers || updates.currentLayerIndex !== undefined) {
        currentPathRef.current =
          newState.layers[newState.currentLayerIndex].path;
        setCurrentPath(currentPathRef.current);
      }
      return newState;
    });
  }, []);

  const addLayer = useCallback(() => {
    const newPath = new CubicPath();
    const newLayer = {
      path: newPath,
      isVisible: true,
      name: `Layer ${canvasState.layers.length}`,
    };

    setCanvasState((prev) => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      currentLayerIndex: prev.layers.length,
      selectedAnchor: null,
      hoveredAnchor: null,
      hit: null,
      dragWhole: false,
      lastMouse: null,
    }));

    currentPathRef.current = newPath;
    setCurrentPath(newPath);
  }, [canvasState.layers.length]);

  const switchLayer = useCallback(
    (index: number) => {
      if (index >= 0 && index < canvasState.layers.length) {
        setCanvasState((prev) => ({
          ...prev,
          currentLayerIndex: index,
          selectedAnchor: null,
          hoveredAnchor: null,
          hit: null,
          dragWhole: false,
          lastMouse: null,
        }));
        currentPathRef.current = canvasState.layers[index].path;
        setCurrentPath(canvasState.layers[index].path);
      }
    },
    [canvasState.layers]
  );

  const updateCurrentPath = useCallback(
    (path: CubicPath) => {
      currentPathRef.current = path;
      // 状態の更新は最小限に抑える
      if (path !== currentPath) {
        setCurrentPath(path);
      }
    },
    [currentPath]
  );

  return {
    canvasState,
    currentPath,
    currentPathRef,
    updateCanvasState,
    addLayer,
    switchLayer,
    updateCurrentPath,
  };
};
