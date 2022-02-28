import React, { useEffect, useState } from "react";
import PartialColorPicker from "./PartialColorPicker";
import { DEFAULT_COLOR_ID, getKnotStringId } from "./utils";

export default function BlockTileColorUpdateModal(props) {
  const [selectedPalateColor, setSelectedPalateColor] = React.useState(
    DEFAULT_COLOR_ID
  );
  const [patternDetails, setPatternDetails] = useState({ ...props.pattern });

  useEffect(() => {
    const stringId = getKnotStringId(
      props.editingString,
      props.selectedTile.knotType
    );
    setSelectedPalateColor(
      props.selectedTile.colors[stringId] || DEFAULT_COLOR_ID
    );
  }, [props.selectedTile]);

  const onUpdate = () => {
    const stringId = getKnotStringId(
      props.editingString,
      props.selectedTile.knotType
    );
    const colors = { ...props.selectedTile.colors };
    colors[stringId] = selectedPalateColor;

    props.onUpdateTile(
      {
        knotType: props.selectedTile.knotType,
        colors
      },
      patternDetails.palatte
    );
  };
  return (
    <div className={"block BlockTileColorUpdateModal"}>
      <div className="modalContentPad">
        <div className={"currentColorContainer"}>
          <div>Current Color: </div>
          <div className="colorDivContainer">
            <PartialColorPicker
              value={
                props.colors?.[
                  props.selectedTile?.colors?.[
                    getKnotStringId(
                      props.editingString,
                      props.selectedTile?.knotType
                    )
                  ]
                ] || "#fff"
              }
            />
          </div>
        </div>
        <div className="colorPlateWrapper" style={{ borderBottom: "none" }}>
          {patternDetails?.palatte?.map?.((p, cIdx) => {
            return (
              <div key={cIdx} className="colorDivContainer">
                <PartialColorPicker
                  onClick={() => setSelectedPalateColor(p.id)}
                  value={p.color}
                  checked={p.id === selectedPalateColor}
                />
              </div>
            );
          })}
        </div>

        <div className="lineButtonWrapper" style={{ marginTop: 20 }}>
          <button
            onClick={onUpdate}
            className="updateButton lineButton btn-green"
          >
            <span>Update Color</span>
            <span className="icon icon-save" />
          </button>
        </div>
      </div>
    </div>
  );
}
