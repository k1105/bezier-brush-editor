import styles from "./LayerControl.module.scss";
import {useState} from "react";

interface LayerControlProps {
  keyIndex: number;
  isExpanded: boolean;
  setExpandedLayers: (expandedLayers: Set<number>) => void;
  isSelected: boolean;
  onSelect: () => void;
  layerName: string;
  onRename: (newName: string) => void;
}

const LayerControl = ({
  keyIndex,
  isExpanded,
  setExpandedLayers,
  isSelected,
  onSelect,
  layerName,
  onRename,
}: LayerControlProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(layerName);

  const stopPropagation = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleNameBlur = () => {
    if (editName !== layerName) {
      onRename(editName);
    }
    setIsEditing(false);
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    }
  };

  return (
    <div
      key={`layer-${keyIndex}`}
      className={`${styles.layer} ${isSelected ? styles.selected : ""}`}
      onClick={(e) => {
        stopPropagation(e);
        onSelect();
        const newExpandedLayers = new Set<number>();
        if (isSelected) {
          newExpandedLayers.add(keyIndex);
        }
        setExpandedLayers(newExpandedLayers);
      }}
      onMouseDown={stopPropagation}
    >
      <div className={styles.header}>
        {isEditing ? (
          <input
            type="text"
            value={editName}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            onClick={stopPropagation}
            className={styles.nameInput}
            autoFocus
          />
        ) : (
          <p onClick={handleNameClick}>{layerName}</p>
        )}
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
