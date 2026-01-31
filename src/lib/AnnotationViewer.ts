import { AnnotationState, MarkerView } from "@markerjs/markerjs3";
import styles from "./lib.css?inline";
import { ViewerToolbar } from "./ViewerToolbar";

/**
 * AnnotationViewer is a web component that allows you to display an image with an annotations overlay on top of it.
 *
 * @example
 * ```js
 * import { AnnotationViewer } from "@markerjs/markerjs-ui";
 *
 * // image to annotate
 * const targetImage = document.createElement("img");
 * targetImage.src = "image.jpg";
 *
 * // create the viewer
 * const viewer = new AnnotationViewer();
 * viewer.targetImage = targetImage;
 * containerDiv.appendChild(viewer);
 * viewer.show(savedState);
 * ```
 */
export class AnnotationViewer extends HTMLElement {
  private _mainContainer?: HTMLDivElement;
  private _toolbarContainer?: HTMLDivElement;
  private _markerViewContainer?: HTMLDivElement;

  private _markerView: MarkerView;
  /**
   * The underlying marker.js 3 `MarkerView` component.
   * This is the component that actually renders the annotations on top of the image.
   */
  public get markerView() {
    return this._markerView;
  }

  private _toolbar?: ViewerToolbar;

  /**
   * The target image element to be annotated.
   * This is the image that will be displayed in the viewer.
   */
  public targetImage?: HTMLImageElement;

  private _theme: "light" | "dark" = "light";
  /**
   * The theme of the viewer. Can be either "light" or "dark".
   */
  public get theme() {
    return this._theme;
  }
  /**
   * Sets the theme of the viewer. Can be either "light" or "dark".
   */
  public set theme(value: "light" | "dark") {
    this._theme = value;
    if (this._mainContainer) {
      this._mainContainer.setAttribute("data-theme", value);
    }
  }

  constructor() {
    super();

    this._markerView = new MarkerView();

    this.addStyles = this.addStyles.bind(this);
    this.createLayout = this.createLayout.bind(this);
    this.addMarkerView = this.addMarkerView.bind(this);
    this.addToolbar = this.addToolbar.bind(this);

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.addStyles();
    this.createLayout();
    this.addMarkerView();
    this.addToolbar();
  }

  disconnectedCallback() {}

  private addStyles() {
    const style = document.createElement("style");
    style.textContent = styles;
    this.shadowRoot?.appendChild(style);
  }

  private createLayout() {
    this._mainContainer = document.createElement("div");
    this._mainContainer.id = "mainContainer";
    this._mainContainer.setAttribute("data-theme", this._theme);
    this._mainContainer.className =
      "flex relative w-full h-full bg-base-200 overflow-hidden";

    this._markerViewContainer = document.createElement("div");
    this._markerViewContainer.id = "markerViewContainer";
    this._markerViewContainer.className =
      "flex overflow-hidden w-full h-full bg-base-200";

    this._mainContainer.appendChild(this._markerViewContainer);

    const outerToolbarContainer = document.createElement("div");
    outerToolbarContainer.id = "toolbarContainer";
    outerToolbarContainer.className =
      "absolute bottom-5 flex items-center justify-end -mx-5 w-full bg-transparent pointer-events-none";

    this._toolbarContainer = document.createElement("div");
    this._toolbarContainer.className =
      "inline-flex pointer-events-auto bg-base-100/40 hover:bg-base-100/90 rounded-md shadow-2xs";

    outerToolbarContainer.appendChild(this._toolbarContainer);
    this._mainContainer.appendChild(outerToolbarContainer);

    this.shadowRoot?.appendChild(this._mainContainer);
  }

  private addMarkerView() {
    if (this.targetImage && this._markerViewContainer && this._markerView) {
      this._markerView.targetImage = this.targetImage;

      // Enable auto-zoom
      this._markerView.autoZoomIn = true;
      this._markerView.autoZoomOut = true;

      this._markerViewContainer.appendChild(this._markerView);
    }
  }

  private addToolbar() {
    if (
      this._toolbar === undefined &&
      this._toolbarContainer &&
      this._markerView
    ) {
      this._toolbar = new ViewerToolbar(this._markerView);
      this._toolbarContainer.appendChild(this._toolbar.getUI());
    }
  }

  /**
   * Displays a previously saved annotation in the viewer.
   *
   * @param state The state to be shown in the viewer.
   */
  public show(state: AnnotationState) {
    if (this._markerView) {
      this._markerView.show(state);
    }
  }
}

if (
  window &&
  window.customElements &&
  window.customElements.get("mjsui-annotation-viewer") === undefined
) {
  window.customElements.define("mjsui-annotation-viewer", AnnotationViewer);
}
