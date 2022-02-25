import "./styles.css";
import pattern from "./data.json";
import { fabric } from "fabric";
import { CANVAS_BASE, getKnotTile, getTileId, transformPalatte } from "./utils";
import { Component } from "react";

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
    this.startTime = null;
    this.timeout = null;
    this.lastTap = 0;
    this.hoveredTile = null;
    this.canvasPadding = 15;
    this.colors = {};
    this.uniqNodes = {};
  }

  componentDidMount() {
    fabric.Object.prototype.hasRotatingPoint = false;
    fabric.Object.prototype.objectCaching = true;

    const { tiles } = pattern;
    const options = {
      width: this.state.canvasWidth + this.canvasPadding,
      height: this.state.canvasHeight + this.canvasPadding,
      selection: false,
      renderOnAddRemove: false,
      allowTouchScrolling: true
    };

    this.colors = transformPalatte(pattern.palatte);

    this.canvas = new fabric.Canvas(`stage`, options);

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
    if (node) {
      this.cacheClonedNode(knotTile, node);
    } else {
      this.uniqNodes[colorString] = knotTile;
    }
    return knotTile;
  };

  cacheClonedNode = (clone, orgNode) => {
    clone.cacheHeight = orgNode.cacheHeight;
    clone.cacheTranslationX = orgNode.cacheTranslationX;
    clone.cacheTranslationY = orgNode.cacheTranslationY;
    clone.cacheWidth = orgNode.cacheWidth;
    clone._cacheCanvas = orgNode._cacheCanvas;
    clone._cacheContext = orgNode._cacheContext;
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
      </div>
    );
  }
}
