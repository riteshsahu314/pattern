import "./styles.scss";
//import pattern from "./data-small.json";
import pattern from "./data-big.json";

import { fabric } from "fabric";
import {
  CANVAS_BASE,
  CIRCLE_COLOR_RADIUS,
  getKnotStringId,
  getKnotTile,
  getTileId,
  KNOT_TYPE,
  renderIconTileCircle,
  transformPalatte
} from "./utils";
import { Component } from "react";
import BlockTileColorUpdateModal from "./BlockTileColorUpdateModal";

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      selectedTile: null,
      zoom: 1,
      tiles: [],
      ksType: "",
      topTiles: [],
      canvasWidth: CANVAS_BASE.WIDTH,
      canvasHeight: CANVAS_BASE.HEIGHT,
      showGrid: true,
      showColors: true,
      loading: false,
      editingString: ""
    };
    this.canvas = null;
    this.selectedTileNode = null;
    this.duplicationNodes = [];
    this.timeout = null;
    this.lastTap = 0;
    this.canvasPadding = 15;
    this.colors = {};
    this.uniqNodes = {};
  }

  componentDidMount() {
    fabric.Object.prototype.hasRotatingPoint = false;
    fabric.Object.prototype.objectCaching = true;

    const commonControlProps = {
      cursorStyle: "pointer",
      mouseUpHandler: this.showTileCircleColorUpdateModal,
      render: renderIconTileCircle("white", CIRCLE_COLOR_RADIUS)
    };

    fabric.Object.prototype.controls.ml = new fabric.Control({
      x: 0.5,
      y: 0,
      offsetX: 17,
      actionName: "rightColor",
      ...commonControlProps
    });

    fabric.Object.prototype.controls.mr = new fabric.Control({
      x: 0,
      y: -0.5,
      offsetY: -17,
      actionName: "leftColor",
      ...commonControlProps
    });

    const { tiles } = pattern;

    this.setState({
      tiles
    });

    const options = {
      width: this.state.canvasWidth + this.canvasPadding,
      height: this.state.canvasHeight + this.canvasPadding,
      selection: false,
      renderOnAddRemove: false,
      allowTouchScrolling: true
    };

    this.colors = transformPalatte(pattern.palatte);

    this.canvas = new fabric.Canvas(`stage`, options);

    this.attachEvents();

    const tileWidth = this.getTileWidth();
    const tileHeight = tileWidth;

    for (let i = 0; i < tiles?.length; i++) {
      for (let j = 0; j < tiles[i]?.length; j++) {
        const node = this.getKnotTileNode(tiles[i][j], {
          i,
          j,
          tileWidth,
          tileHeight
        });
        this.canvas.add(node);
        node.uniq && this.canvas.renderAll();
      }
    }

    this.canvas.renderAll();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.zoom !== this.state.zoom) {
      if (this.canvas.setWidth) {
        this.canvas.setZoom(this.state.zoom);
        this.canvas.setWidth(
          this.state.canvasWidth * this.state.zoom + this.canvasPadding
        );
        this.canvas.setHeight(
          this.state.canvasHeight * this.state.zoom + this.canvasPadding
        );
        // this.setCircleColorXPos();
        // this.updateTileColor();
      }
    }
  }

  attachEvents = () => {
    this.canvas.on("mouse:dblclick", (options) => {
      this.handleDoubleClick();
    });

    const onMouseDown = (e) => {
      const node = e.target;

      if (node?.ksType === "knot") {
        const { tiles } = this.state;
        this.selectedTileNode = node;
        const selectedTile = tiles[node.i][node.j];
        this.setState({
          selectedTile,
          ksType: "knot"
        });
        this.updateTileCircleColor(selectedTile);
      } else if (node?.ksType === "knot-top") {
        const { topTiles } = this.state;
        this.selectedTileNode = node;
        const selectedTile = topTiles[node.i];
        this.setState({
          selectedTile,
          ksType: "knot-top"
        });
        this.updateTileCircleColor(selectedTile);
      }
    };

    this.canvas.on("mouse:down", onMouseDown);
  };

  colorsToString(colors, knotType) {
    return Object.entries(colors)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .reduce((pv, cv) => pv + cv[0] + cv[1], knotType);
  }

  getKnotTileNode = (tileData, options) => {
    const { colors, knotType } = tileData;
    const { tileWidth, tileHeight, i, j, ...restOptions } = options;
    const colorString = this.colorsToString(colors, knotType);
    const node = this.uniqNodes[colorString];
    const knotTile = getKnotTile({
      width: tileWidth,
      height: tileHeight,
      top: (tileWidth * i) / 2 + tileWidth / 2,
      left: i % 2 === 0 ? tileWidth * j : tileWidth * j + tileWidth / 2,
      colors,
      knotType,
      id: getTileId(i, j),
      i,
      j,
      name: `${i}_${j}`,
      selectable: true,
      hoverCursor: "pointer",
      showGrid: this.state.showGrid,
      allColors: this.colors,
      uniq: !node,
      ...restOptions
    });
    //
    if (node) {
      this.cacheClonedNode(knotTile, node);
    } else {
      knotTile.shouldCache = () => true;
      this.uniqNodes[colorString] = knotTile;
    }
    return knotTile;
  };

  onUpdateTile = ({ colors, knotType }, palatte = null) => {
    const allObjects = this.canvas.getObjects();

    if (palatte) {
      this.colors = transformPalatte(palatte);
    }

    if (colors) {
      const dt = this.selectedTileNode;
      if (dt) {
        if (this.state.ksType === "knot") {
          const knotTile = this.getKnotTileNode(
            {
              colors: this.state.showColors ? colors : {},
              knotType
            },
            {
              width: dt.initialWidth,
              height: dt.initialHeight,
              i: dt.i,
              j: dt.j,
              top: dt.top,
              left: dt.left
            }
          );

          this.canvas.insertAt(
            knotTile,
            allObjects.findIndex(
              (o) => o.i === dt.i && o.j === dt.j && o.ksType === "knot"
            ),
            true
          );
          this.canvas.renderAll();

          const tiles = [...this.state.tiles];
          tiles[knotTile.i][knotTile.j].colors = colors;
          tiles[knotTile.i][knotTile.j].knotType = knotType;
          this.setState({ tiles });
        }
      }
    }

    this.updateTileCircleColor(this.state.selectedTile);

    this.hideTileCircleColorUpdateModal();
  };

  cacheClonedNode = (clone, orgNode) => {
    clone.cacheHeight = orgNode.cacheHeight;
    clone.cacheTranslationX = orgNode.cacheTranslationX;
    clone.cacheTranslationY = orgNode.cacheTranslationY;
    clone.cacheWidth = orgNode.cacheWidth;
    clone._cacheCanvas = orgNode._cacheCanvas;
    clone._cacheContext = orgNode._cacheContext;
    clone.dirty = false;
    clone.zoomX = orgNode.zoomX;
    clone.zoomY = orgNode.zoomY;

    clone.shouldCache = () => true;
    clone.isCacheDirty = () => false;
  };

  getTileWidth = () => {
    const { columnCount: cols, rowCount: rows } = pattern;
    const { canvasWidth } = this.state;
    return canvasWidth / Math.max(rows, cols);
  };

  handleZoomIn = () => {
    this.setState((prev) => ({ zoom: prev.zoom + 0.2 }));
  };

  handleZoomOut = () => {
    this.setState((prev) => ({ zoom: prev.zoom - 0.2 }));
  };

  showTileCircleColorUpdateModal = (e, evt) => {
    const action = evt?.action;

    if (action === "leftColor") {
      this.setState({ editingString: "left" });
    } else if (action === "rightColor") {
      this.setState({ editingString: "right" });
    } else if (action.startsWith("top")) {
      this.setState({ editingString: action?.split("-").pop() || "" });
    }
  };

  hideTileCircleColorUpdateModal = () => this.setState({ editingString: "" });

  updateTileCircleColor = (tile) => {
    const leftColor = tile.colors[getKnotStringId("left", tile.knotType)];
    const rightColor = tile.colors[getKnotStringId("right", tile.knotType)];
    fabric.Object.prototype.controls.ml.render = renderIconTileCircle(
      this.colors?.[rightColor] || "#fff"
    );
    fabric.Object.prototype.controls.mr.render = renderIconTileCircle(
      this.colors?.[leftColor] || "#fff"
    );
  };

  handleDoubleClick = () => {
    if (this.selectedTileNode?.ksType === "knot") {
      this.onUpdateTile({
        colors: this.state.selectedTile?.colors,
        knotType:
          this.state.selectedTile?.knotType === KNOT_TYPE.LF
            ? KNOT_TYPE.RF
            : KNOT_TYPE.LF
      });
    }
  };

  render() {
    return (
      <div>
        <div style={{ marginBottom: 30 }}>
          <button onClick={this.handleZoomIn}>Zoom In</button>
          <button onClick={this.handleZoomOut}>Zoom Out</button>
        </div>
        <div style={{ backgroundColor: "black" }}>
          <canvas id="stage"></canvas>
        </div>
        {this.state.editingString && (
          <BlockTileColorUpdateModal
            editingString={this.state.editingString}
            palatte={pattern?.palatte}
            handleCancel={this.hideTileCircleColorUpdateModal}
            onUpdateTile={this.onUpdateTile}
            colors={this.colors}
            selectedTile={this.state.selectedTile}
            ksType={this.state.ksType}
            open={this.state.open}
            pattern={pattern}
          />
        )}
      </div>
    );
  }
}
