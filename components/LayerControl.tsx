import styles from "./LayerControl.module.scss";
import {Icon} from "@iconify/react/dist/iconify.js";

interface LayerControlProps {
  keyIndex: number;
  isExpanded: boolean;
  expandedLayers: Set<number>;
  setExpandedLayers: (expandedLayers: Set<number>) => void;
  isSelected: boolean;
  onSelect: () => void;
}

const LayerControl = ({
  keyIndex,
  isExpanded,
  expandedLayers,
  setExpandedLayers,
  isSelected,
  onSelect,
}: LayerControlProps) => {
  const toggleLayer = (index: number) => {
    const newExpandedLayers = new Set<number>(expandedLayers);
    if (newExpandedLayers.has(index)) {
      newExpandedLayers.delete(index);
    } else {
      newExpandedLayers.add(index);
    }
    setExpandedLayers(newExpandedLayers);
  };

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      key={`layer-${keyIndex}`}
      className={`${styles.layer} ${isSelected ? styles.selected : ""}`}
      onClick={(e) => {
        stopPropagation(e);
        onSelect();
      }}
      onMouseDown={stopPropagation}
    >
      <div
        className={styles.header}
        onClick={(e) => {
          stopPropagation(e);
          toggleLayer(keyIndex);
        }}
      >
        <p>Layer {keyIndex}</p>
        <div className={styles.iconContainer}>
          <Icon
            icon="ic:baseline-control-point-duplicate"
            className={styles.icon}
          />
          <Icon icon="ic:baseline-delete" className={styles.icon} />
        </div>
      </div>
      <div className={`${styles.content} ${isExpanded ? styles.expanded : ""}`}>
        <div className={styles.inputContainer}>
          <label>brush type</label>
          <select onClick={stopPropagation} onMouseDown={stopPropagation}>
            <option value="circle">Circle</option>
            <option value="square">Square</option>
          </select>
        </div>
        <div className={styles.inputContainer}>
          <label>animation type</label>
          <select onClick={stopPropagation} onMouseDown={stopPropagation}>
            <option value="default">Default</option>
            <option value="backAndForth">Back and Forth</option>
          </select>
        </div>
        <div className={styles.inputContainer}>
          <label>offset</label>
          <input
            type="range"
            min="0"
            max="100"
            value={0}
            onChange={(e) => console.log("offset changed:", e.target.value)}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
          />
        </div>
        <div className={styles.inputContainer}>
          <label>speed</label>
          <input
            type="range"
            min="0"
            max="5"
            value={0}
            step="0.1"
            onChange={(e) => console.log("speed changed:", e.target.value)}
            onClick={stopPropagation}
            onMouseDown={stopPropagation}
          />
        </div>
      </div>
    </div>
  );
};

export default LayerControl;
