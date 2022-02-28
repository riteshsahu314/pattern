import { fabric } from "fabric";

setDefaultsForFabric();

export const CANVAS_BASE = {
  WIDTH: 600,
  HEIGHT: 600
};

export const DEFAULT_COLOR_ID = 1;

export const getKnotTile = (options = {}) => {
  const {
    height = 0,
    width = 0,
    colors = {},
    knotType = KNOT_TYPE.LF,
    showGrid = true,
    allColors = {},
    ...restOptions
  } = options;
  const diagonalWidth = width / Math.sqrt(2);
  const knotPathData = KnotPaths[knotType] || { paths: [] };
  const knotPaths = knotPathData.paths
    .map(
      (dt) =>
        new fabric.Path(dt.d, {
          id: dt.id,
          fill: allColors[colors[dt.id]] || "#fff",
          stroke: "#000"
        })
    )
    .concat([
      new fabric.Rect({
        id: "border",
        top: 0,
        left: 0,
        width: knotPathData.width,
        height: knotPathData.height,
        stroke: "#f7e64d",
        fill: "transparent",
        strokeWidth: showGrid ? 1 : 0
      }),
      new fabric.Rect({
        id: "dash-border",
        top: -3,
        left: -3,
        width: knotPathData.width,
        height: knotPathData.height,
        stroke: "#38B4EB",
        fill: "transparent",
        strokeWidth: 0,
        strokeDashArray: [8, 8]
      })
    ]);

  const group = new fabric.Group(knotPaths || [], {
    width: knotPathData.width,
    height: knotPathData.height,
    ksType: "knot",
    lockMovementX: true,
    lockMovementY: true,
    initialWidth: width,
    initialHeight: height,
    objectCaching: true
  });

  group.setOptions({
    ...restOptions,
    angle: -45
  });

  width && group.scaleToWidth(diagonalWidth);

  return group;
};

function setDefaultsForFabric() {
  fabric.Object.prototype.set({
    transparentCorners: false,
    borderColor: "#38B4EB",
    borderScaleFactor: 3,
    cornerColor: "#38B4EB",
    cornerStrokeColor: "#38B4EB",
    fill: "#fff",
    hoverCursor: "pointer",
    _controlsVisibility: {
      tl: false,
      tr: false,
      br: false,
      bl: false,
      ml: true,
      mt: false,
      mr: true,
      mb: false,
      mtr: false
    }
  });
}

export const getKnotStringId = (pos = "left", knotType) => {
  if (pos === "left") {
    return knotType === KNOT_TYPE.LF ? "a-out" : "d-in";
  } else if (pos === "right") {
    return knotType === KNOT_TYPE.LF ? "d-in" : "a-out";
  } else {
    return pos;
  }
};

export const CIRCLE_COLOR_RADIUS = 15;

export const defaultColors = {
  "b-out": "#fff",
  "c-out": "#fff"
};

export const allDefaultColors = {
  "a-in": "#fff",
  "a-out": "#fff",
  "b-in": "#fff",
  "b-out": "#fff",
  "c-in": "#fff",
  "c-out": "#fff",
  "d-in": "#fff",
  "d-out": "#fff"
};

export const getTileId = (i, j) => {
  return `tile_${i}-${j}`;
};

export const transformPalatte = (palatte = []) => {
  const colors = {};
  palatte.map((dt) => {
    colors[dt.id] = dt.color;
  });
  return colors;
};

export function renderIcon(ctx, left, top) {
  ctx.save();
  ctx.translate(left, top);
  ctx.beginPath();
  ctx.arc(0, 0, 10, 0, 2 * Math.PI);
  ctx.fill();
  ctx.restore();
}

export const KNOT_TYPE = {
  LF: 1,
  RF: 3
};

export const KnotPaths = {
  [KNOT_TYPE.RF]: {
    width: 155,
    height: 155,
    paths: [
      {
        d:
          "M65.5273.5783h-42.33c-.16 19.46 8.68 30.99 12.04 34.66-3.68-3.36-15.21-12.2-34.66-12.04v42.33l95.73 30.8-30.78-95.75z",
        id: "a-in"
      },
      {
        d:
          "M103.9683 103.9883s38.43-40.9 50.38-38.23l-.02-42.96c-21.12-3.82-76.78 54.66-76.78 54.66",
        id: "c-in"
      },
      {
        d:
          "M77.4484 77.4683s-57.75 55.12-54.6601 76.78c5.28.13 36.8501.07 42.96.02-2.6099-11.71 36.56-48.8 38.17-50.33",
        id: "c-out"
      },
      {
        d:
          "M77.3911 77.4683s59.81-57.21 54.67-76.89c-5.28-.13-36.85-.07-42.96-.02 1.7991 8.073-16.259 28.209-28.178 40.44",
        id: "b-in"
      },
      {
        d:
          "M61.0991 40.8093c-12.261 11.923-52.599 50.046-60.598 48.259l.02 42.96c25.38.81 76.87-54.56 76.87-54.56",
        id: "b-out"
      },
      {
        d:
          "M128.1973 91.9083l-41.26-91.33h-29.6c-11.83 22.82 22.3 79.08 22.3 79.08s-56.26-34.13-79.08-22.3v29.6l91.33 41.26 18.15-18.15 18.16-18.16z",
        id: "d-in"
      },
      {
        d:
          "M131.1573 131.0083s9.72 7.55 23.25 1.13v-42.17l-44.2 20.1-20.1 44.2h42.17c6.43-13.54-1.12-23.26-1.12-23.26z",
        id: "d-in"
      },
      {
        d:
          "M154.2373 98.3383v-8.37l.11-24.21c-6.7701-6.16-24.0101-1.99-24.0101-1.99l-33.32 33.27-33.2699 33.32s-4.1801 17.23 1.99 24.01l24.2099-.11h8.37l27.96-27.96 27.9601-27.96z",
        id: "a-out"
      }
    ]
  },
  [KNOT_TYPE.LF]: {
    width: 155,
    height: 155,
    paths: [
      {
        id: "a-in",
        d:
          "M154.3 89.3783v42.33c-19.46.16-30.9901-8.68-34.66-12.04 3.36 3.68 12.2 15.21 12.04 34.66H89.35l-30.8-95.74 95.75 30.79z"
      },
      {
        id: "c-in",
        d:
          "M50.89 50.9383s40.9-38.43 38.23-50.38l42.96.02c3.82 21.12-54.66 76.78-54.66 76.78"
      },
      {
        id: "c-out",
        d:
          "M77.41 77.4583s-55.12 57.75-76.78 54.66c-.13-5.28-.07-36.85-.02-42.96 11.71 2.61 48.8-36.56 50.33-38.17"
      },
      {
        id: "b-in",
        d:
          "M77.4099 77.4103s57.21-59.81 76.89-54.67c.13 5.28.07 36.85.02 42.96-8.073-1.799-28.209 16.259-40.44 28.178"
      },
      {
        id: "b-out",
        d:
          "M113.8519 93.5343c-11.923 12.261-49.829 52.767-48.042 60.766-6.12.05-37.69.11-42.96-.02-.81-25.39 54.56-76.87 54.56-76.87"
      },
      {
        id: "d-in",
        d:
          "M62.96 26.6983l91.33 41.26v29.6c-22.82 11.83-79.08-22.3-79.08-22.3s34.13 56.25 22.3 79.08h-29.6l-41.26-91.33 18.15-18.15 18.16-18.16z"
      },
      {
        id: "d-in",
        d:
          "M23.86 23.9083s-7.55-9.72-1.13-23.25c8.67.22 42.17 0 42.17 0l-20.1 44.2-44.2 20.1v-42.17c13.55-6.43 23.26 1.12 23.26 1.12z"
      },
      {
        id: "a-out",
        d:
          "M56.54.6583h8.37l24.21-.11c6.16 6.77 1.99 24.01 1.99 24.01l-33.28 33.32-33.32 33.27s-17.23 4.18-24.01-1.99l.11-24.21v-8.37l27.96-27.96L56.54.6583z"
      }
    ]
  }
};

export const getColorCircleXPos = (pos, stretch = 1) => {
  return (0.33333333333 * pos - 0.83333333333) * stretch;
};

export function renderIconTileCircle(color = "white", radius = 15) {
  return (ctx, left, top) => {
    ctx.save();
    ctx.translate(left, top);

    // ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.shadowColor = "black";
    ctx.strokeStyle = "black";
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };
}
