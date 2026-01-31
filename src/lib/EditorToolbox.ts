import { MarkerArea } from "@markerjs/markerjs3";
import { BaseToolbar } from "./BaseToolbar";
import { ToolbarAction } from "./models/toolbar";

import UndoIcon from "@/assets/icons/arrow-back-up.svg?raw";
import RedoIcon from "@/assets/icons/arrow-forward-up.svg?raw";
import ZoomInIcon from "@/assets/icons/plus.svg?raw";
import ZoomOutIcon from "@/assets/icons/minus.svg?raw";
import ZoomResetIcon from "@/assets/icons/relation-one-to-one.svg?raw";

import FontIcon from "@/assets/icons/typography.svg?raw";
import StrokeIcon from "@/assets/icons/border-style-2.svg?raw";
import FillIcon from "@/assets/icons/droplet-half-2.svg?raw";
import OpacityIcon from "@/assets/icons/circle-half-2.svg?raw";
import NotesIcon from "@/assets/icons/notes.svg?raw";

import { NotesToolboxPanel } from "./NotesToolboxPanel";
import { ToolboxPanel } from "./ToolboxPanel";
import { OpacityToolboxPanel } from "./OpacityToolboxPanel";
import { FillToolboxPanel } from "./FillToolboxPanel";
import { StrokeToolboxPanel } from "./StrokeToolboxPanel";
import { FontToolboxPanel } from "./FontToolboxPanel";

export class EditorToolbox extends BaseToolbar {
  private _toolbarContainer?: HTMLDivElement;
  private _leftActionContainer?: HTMLDivElement;
  private _propertyPanelContainer?: HTMLDivElement;
  private _rightActionContainer?: HTMLDivElement;

  private _undoButton?: HTMLButtonElement;
  private _redoButton?: HTMLButtonElement;

  private _zoomInButton?: HTMLButtonElement;
  private _zoomOutButton?: HTMLButtonElement;
  private _zoomResetButton?: HTMLButtonElement;

  private _propertyPanels: ToolboxPanel[] = [];

  protected _markerArea: MarkerArea;

  constructor(markerArea: MarkerArea) {
    super();

    this._markerArea = markerArea;

    this.getUI = this.getUI.bind(this);
    this.createActionButton = this.createActionButton.bind(this);
    this.handleActionButtonClick = this.handleActionButtonClick.bind(this);
    this.updateToolbarButtons = this.updateToolbarButtons.bind(this);
    this.updatePanelVisibility = this.updatePanelVisibility.bind(this);
    this.updatePanelContent = this.updatePanelContent.bind(this);
    this.applyPanelValues = this.applyPanelValues.bind(this);
  }

  public getUI() {
    if (this._toolbarContainer === undefined) {
      this.attachMarkerAreaEvents();
      this._toolbarContainer = document.createElement("div");
      this._toolbarContainer.className =
        "flex space-x-1 p-2 justify-between @container";

      this._leftActionContainer = document.createElement("div");
      this._leftActionContainer.className =
        "inline-flex space-x-1 p-1 border-1 border-transparent";
      this._toolbarContainer.appendChild(this._leftActionContainer);

      this._propertyPanelContainer = document.createElement("div");
      this._propertyPanelContainer.className =
        "inline-flex space-x-1 items-center";
      this._toolbarContainer.appendChild(this._propertyPanelContainer);

      this._rightActionContainer = document.createElement("div");
      this._rightActionContainer.className =
        "inline-flex space-x-1 p-1 border-1 border-transparent";
      this._toolbarContainer.appendChild(this._rightActionContainer);

      this._undoButton = this.createActionButton("Undo", "undo", UndoIcon);
      this._leftActionContainer.appendChild(this._undoButton);
      this._redoButton = this.createActionButton("Redo", "redo", RedoIcon);
      this._redoButton.classList.add("hidden", "@xl:flex");
      this._leftActionContainer.appendChild(this._redoButton);

      const zoomGroup = document.createElement("div");
      zoomGroup.className = "join";
      this._rightActionContainer.appendChild(zoomGroup);

      this._zoomOutButton = this.createActionButton(
        "Zoom Out",
        "zoom-out",
        ZoomOutIcon
      );
      this._zoomOutButton.classList.add("join-item");
      zoomGroup.appendChild(this._zoomOutButton);

      this._zoomResetButton = this.createActionButton(
        "Zoom Reset",
        "zoom-reset",
        ZoomResetIcon
      );
      this._zoomResetButton.classList.add("join-item", "hidden", "@xl:flex");
      zoomGroup.appendChild(this._zoomResetButton);

      this._zoomInButton = this.createActionButton(
        "Zoom In",
        "zoom-in",
        ZoomInIcon
      );
      this._zoomInButton.classList.add("join-item");
      zoomGroup.appendChild(this._zoomInButton);

      // property panels
      const fontPanel = new FontToolboxPanel(
        this._markerArea,
        "Font",
        FontIcon
      );
      this._propertyPanels.push(fontPanel);

      const strokePanel = new StrokeToolboxPanel(
        this._markerArea,
        "Stroke",
        StrokeIcon
      );
      this._propertyPanels.push(strokePanel);

      const fillPanel = new FillToolboxPanel(
        this._markerArea,
        "Fill",
        FillIcon
      );
      this._propertyPanels.push(fillPanel);

      const opacityPanel = new OpacityToolboxPanel(
        this._markerArea,
        "Opacity",
        OpacityIcon
      );
      this._propertyPanels.push(opacityPanel);

      const notesPanel = new NotesToolboxPanel(
        this._markerArea,
        "Notes",
        NotesIcon
      );
      this._propertyPanels.push(notesPanel);

      this._propertyPanels.forEach((panel) => {
        this._propertyPanelContainer?.appendChild(panel.getUI());
      });
    }

    this._markerArea.addEventListener("markerselect", () => {
      this.updatePanelVisibility();
      this.updatePanelContent();
    });
    this._markerArea.addEventListener("markerdeselect", () => {
      this.applyPanelValues();
      this.updatePanelVisibility();
    });

    this.updateToolbarButtons();

    return this._toolbarContainer;
  }

  private attachMarkerAreaEvents() {
    this._markerArea.addEventListener("areastatechange", () => {
      this.updateToolbarButtons();
    });
  }

  protected createActionButton(
    title: string,
    action: ToolbarAction,
    icon: string
  ) {
    return super.createActionButton(
      title,
      action,
      icon,
      this.handleActionButtonClick
    );
  }

  private handleActionButtonClick(action: ToolbarAction) {
    switch (action) {
      case "undo": {
        if (this._markerArea.isUndoPossible) {
          this._markerArea.undo();
        }
        break;
      }
      case "redo": {
        if (this._markerArea.isRedoPossible) {
          this._markerArea.redo();
        }
        break;
      }
      case "zoom-in": {
        this._markerArea.zoomLevel += 0.1;
        break;
      }
      case "zoom-out": {
        if (this._markerArea.zoomLevel > 0.2) {
          this._markerArea.zoomLevel -= 0.1;
        }
        break;
      }
      case "zoom-reset": {
        if (this._markerArea.autoZoomIn || this._markerArea.autoZoomOut) {
          this._markerArea.autoZoom();
        } else {
          this._markerArea.zoomLevel = 1;
        }
        break;
      }
    }
    this.updateToolbarButtons();
  }

  private updateToolbarButtons() {
    if (this._markerArea) {
      this._undoButton?.classList.toggle(
        "btn-disabled",
        !this._markerArea.isUndoPossible
      );
      this._redoButton?.classList.toggle(
        "btn-disabled",
        !this._markerArea.isRedoPossible
      );
    }
  }

  private updatePanelVisibility() {
    this._propertyPanels.forEach((panel) => {
      panel.updateVisibility();
    });
  }

  private updatePanelContent() {
    this._propertyPanels.forEach((panel) => {
      panel.updateContent();
    });
  }

  private applyPanelValues() {
    this._propertyPanels.forEach((panel) => {
      panel.applyValues();
    });
  }
}
