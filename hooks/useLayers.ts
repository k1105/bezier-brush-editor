import {useCallback} from "react";
import {CubicPath} from "@/lib/geometry";
import type {Layer} from "@/types/types";

const generateUniqueLayerName = (
  existingLayers: Layer[],
  baseName: string = "Layer"
): string => {
  const existingNames = new Set(existingLayers.map((layer) => layer.name));
  let name = baseName;
  let counter = 1;

  while (existingNames.has(name)) {
    name = `${baseName} ${counter}`;
    counter++;
  }

  return name;
};

export const useLayers = (
  layers: Layer[],
  currentLayerIndex: number,
  onUpdate: (updatedLayers: Layer[], newIndex: number) => void
) => {
  const addLayer = useCallback(() => {
    const newPath = new CubicPath();
    const newLayer: Layer = {
      path: newPath,
      isVisible: true,
      name: generateUniqueLayerName(layers),
    };
    onUpdate([...layers, newLayer], layers.length);
  }, [layers, onUpdate]);

  const removeLayer = useCallback(
    (index: number) => {
      if (layers.length <= 1) return; // 最後のレイヤーは削除できない
      const newLayers = layers.filter((_, i) => i !== index);
      // 削除後の新しいインデックスを計算
      let newIndex = currentLayerIndex;
      if (index < currentLayerIndex) {
        // 削除するレイヤーが現在のレイヤーより前にある場合
        newIndex = currentLayerIndex - 1;
      } else if (index === currentLayerIndex) {
        // 削除するレイヤーが現在のレイヤーの場合
        newIndex = Math.min(currentLayerIndex, newLayers.length - 1);
      }
      // 現在のレイヤーより後ろのレイヤーを削除する場合はインデックスは変わらない
      onUpdate(newLayers, newIndex);
    },
    [layers, currentLayerIndex, onUpdate]
  );

  const toggleLayerVisibility = useCallback(
    (index: number) => {
      const newLayers = layers.map((layer, i) =>
        i === index ? {...layer, isVisible: !layer.isVisible} : layer
      );
      onUpdate(newLayers, currentLayerIndex);
    },
    [layers, currentLayerIndex, onUpdate]
  );

  const renameLayer = useCallback(
    (index: number, newName: string) => {
      // 新しい名前が既存の名前と重複していないかチェック
      const isNameUnique = !layers.some(
        (layer, i) => i !== index && layer.name === newName
      );
      if (!isNameUnique) {
        console.warn(`Layer name "${newName}" is already in use`);
        return;
      }

      const newLayers = layers.map((layer, i) =>
        i === index ? {...layer, name: newName} : layer
      );
      onUpdate(newLayers, currentLayerIndex);
    },
    [layers, currentLayerIndex, onUpdate]
  );

  const updateLayerPath = useCallback(
    (index: number, path: CubicPath) => {
      const newLayers = layers.map((layer, i) =>
        i === index ? {...layer, path} : layer
      );
      onUpdate(newLayers, currentLayerIndex);
    },
    [layers, currentLayerIndex, onUpdate]
  );

  const moveLayer = useCallback(
    (fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;
      const newLayers = [...layers];
      const [movedLayer] = newLayers.splice(fromIndex, 1);
      newLayers.splice(toIndex, 0, movedLayer);
      const newCurrentIndex =
        currentLayerIndex === fromIndex
          ? toIndex
          : currentLayerIndex > fromIndex && currentLayerIndex <= toIndex
          ? currentLayerIndex - 1
          : currentLayerIndex >= toIndex && currentLayerIndex < fromIndex
          ? currentLayerIndex + 1
          : currentLayerIndex;
      onUpdate(newLayers, newCurrentIndex);
    },
    [layers, currentLayerIndex, onUpdate]
  );

  return {
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    renameLayer,
    updateLayerPath,
    moveLayer,
  };
};
