import React from "react";

export default function PartialColorPicker({
  value,
  className,
  onClick,
  disabled = false,
  checked = false
}) {
  return (
    <div className={`partial PartialColorPicker ${className}`}>
      <div
        className="swatch"
        style={{
          backgroundColor: value,
          cursor: disabled ? "default" : "pointer"
        }}
        onClick={(e) => {
          !disabled && onClick(e);
        }}
      />
      {checked && <div className={"colorPickerCheck"}>✔</div>}
    </div>
  );
}
