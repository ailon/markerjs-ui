import { MarkerView } from "@markerjs/markerjs3";
import { BaseToolbar } from "./BaseToolbar";
import { ToolbarAction } from "./models/toolbar";

import ZoomInIcon from "@/assets/icons/plus.svg?raw";
import ZoomOutIcon from "@/assets/icons/minus.svg?raw";
import ZoomResetIcon from "@/assets/icons/relation-one-to-one.svg?raw";
import ZoomToFitIcon from "@/assets/icons/maximize.svg?raw";

export class ViewerToolbar extends BaseToolbar {
  private _toolbarContainer?: HTMLDivElement;
  private _rightActionContainer?: HTMLDivElement;

  private _zoomInButton?: HTMLButtonElement;
  private _zoomOutButton?: HTMLButtonElement;
  private _zoomResetButton?: HTMLButtonElement;
  private _zoomToFitButton?: HTMLButtonElement;

  protected _markerView: MarkerView;

  constructor(markerView: MarkerView) {
    super();

    this._markerView = markerView;

    this.getUI = this.getUI.bind(this);
    this.createActionButton = this.createActionButton.bind(this);
    this.handleActionButtonClick = this.handleActionButtonClick.bind(this);
  }

  public getUI() {
    if (this._toolbarContainer === undefined) {
      this._toolbarContainer = document.createElement("div");
      this._toolbarContainer.className = "inline-flex";

      this._rightActionContainer = document.createElement("div");
      this._rightActionContainer.className = "inline-flex space-x-1";
      this._toolbarContainer.appendChild(this._rightActionContainer);

      const zoomGroup = document.createElement("div");
      zoomGroup.className = "join";
      this._rightActionContainer.appendChild(zoomGroup);

      this._zoomOutButton = this.createActionButton(
        "Zoom Out",
        "zoom-out",
        ZoomOutIcon,
      );
      this._zoomOutButton.classList.add("join-item");
      zoomGroup.appendChild(this._zoomOutButton);

      this._zoomResetButton = this.createActionButton(
        "Zoom Reset",
        "zoom-reset",
        ZoomResetIcon,
      );
      this._zoomResetButton.classList.add("join-item");
      zoomGroup.appendChild(this._zoomResetButton);

      this._zoomToFitButton = this.createActionButton(
        "Zoom to Fit",
        "zoom-to-fit",
        ZoomToFitIcon,
      );
      this._zoomToFitButton.classList.add("join-item");
      zoomGroup.appendChild(this._zoomToFitButton);

      this._zoomInButton = this.createActionButton(
        "Zoom In",
        "zoom-in",
        ZoomInIcon,
      );
      this._zoomInButton.classList.add("join-item");
      zoomGroup.appendChild(this._zoomInButton);
    }

    return this._toolbarContainer;
  }

  protected createActionButton(
    title: string,
    action: ToolbarAction,
    icon: string,
  ) {
    return super.createActionButton(
      title,
      action,
      icon,
      this.handleActionButtonClick,
    );
  }

  private handleActionButtonClick(action: ToolbarAction) {
    switch (action) {
      case "zoom-in": {
        this._markerView.zoomLevel += 0.1;
        break;
      }
      case "zoom-out": {
        if (this._markerView.zoomLevel > 0.2) {
          this._markerView.zoomLevel -= 0.1;
        }
        break;
      }
      case "zoom-reset": {
        this._markerView.zoomLevel = 1;
        break;
      }
      case "zoom-to-fit": {
        this._markerView.autoZoom();
        break;
      }
    }
  }
}
