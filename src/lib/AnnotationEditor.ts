import { AnnotationState, MarkerArea, Renderer } from "@markerjs/markerjs3";
import styles from "./lib.css?inline";
import { EditorToolbar } from "./EditorToolbar";
import { EditorToolbox } from "./EditorToolbox";

/**
 * Annotation editor custom event types.
 */
export interface AnnotationEditorEventMap {
  /**
   * Close button clicked.
   */
  editorclose: CustomEvent<AnnotationEditorEventData>;
  /**
   * Save button clicked.
   */
  editorsave: CustomEvent<AnnotationEditorRenderEventData>;
}

/**
 * Annotation editor custom event data.
 */
export interface AnnotationEditorEventData {
  /**
   * The annotation editor instance.
   */
  annotationEditor: AnnotationEditor;
}

/**
 * Annotation editor custom event data for the render/save event.
 */
export interface AnnotationEditorRenderEventData
  extends AnnotationEditorEventData {
  /**
   * The annotation state.
   */
  state: AnnotationState;
  /**
   * The rendered image data URL.
   */
  dataUrl?: string;
}

export interface AnnotationEditorSettings {
  /**
   * Whether the rasterized image should be rendered on save.
   * If set to false the `editorsave` event will not contain the `dataUrl` property.
   */
  renderOnSave?: boolean;
  /**
   * Configuration for the image renderer.
   * This is used to configure the image rendering settings.
   */
  rendererSettings: {
    /**
     * Whether the image should be rendered at the original (natural) target image size.
     */
    naturalSize?: boolean;
    /**
     * Rendered image type (`image/png`, `image/jpeg`, etc.).
     */
    imageType?: string;
    /**
     * For formats that support it, specifies rendering quality.
     *
     * In the case of `image/jpeg` you can specify a value between 0 and 1 (lowest to highest quality).
     *
     * @type {number} - image rendering quality (0..1)
     */
    imageQuality?: number;
    /**
     * When set to true, only the marker layer without the original image will be rendered.
     */
    markersOnly?: boolean;

    /**
     * When set and `naturalSize` is `false` sets the width of the rendered image.
     *
     * Both `width` and `height` have to be set for this to take effect.
     */
    width?: number;
    /**
     * When set and `naturalSize` is `false` sets the height of the rendered image.
     *
     * Both `width` and `height` have to be set for this to take effect.
     */
    height?: number;
  };
  /**
   * When set to true, the editor will automatically zoom in if the image is smaller than the viewport.
   */
  autoZoomIn?: boolean;
  /**
   * When set to true, the editor will automatically zoom out if the image is larger than the viewport.
   */
  autoZoomOut?: boolean;
}

/**
 * AnnotationEditor is a web component that, as the name suggests, allows users to annotate images easily.
 *
 * It's a UI wrapper for marker.js 3 `MarkerArea` component.
 *
 * @group Components
 *
 * @example
 *
 * ```js
 * import { AnnotationEditor } from "@markerjs/markerjs-ui";
 *
 * // image to annotate
 * const targetImage = document.createElement("img");
 * targetImage.src = "image.jpg";
 *
 * // create the editor
 * const editor = new AnnotationEditor();
 * editor.targetImage = targetImage;
 * containerDiv.appendChild(editor);
 *
 * // handle save event
 * editor.addEventListener("editorsave", (event) => {
 * console.log("Editor state:", event.detail.state);
 * const dataUrl = event.detail.dataUrl;
 *
 * // download the rasterized image
 * if (dataUrl) {
 *   const link = document.createElement("a");
 *   link.href = dataUrl;
 *   link.download = "annotation.png";
 *   link.click();
 * }
 * });
 * ```
 */
export class AnnotationEditor extends HTMLElement {
  private _mainContainer?: HTMLDivElement;
  private _toolbarContainer?: HTMLDivElement;
  private _toolboxContainer?: HTMLDivElement;
  private _markerAreaContainer?: HTMLDivElement;

  private _markerArea: MarkerArea;
  /**
   * The underlying `MarkerArea` component.
   * This is the main component that handles the annotation functionality.
   */
  public get markerArea() {
    return this._markerArea;
  }

  private _toolbar?: EditorToolbar;
  private _toolbox?: EditorToolbox;

  /**
   * The target image to annotate.
   */
  public targetImage?: HTMLImageElement;

  private _theme: "light" | "dark" = "light";
  /**
   * The theme of the editor.
   * Can be either "light" or "dark".
   *
   * The default is "light".
   */
  public get theme() {
    return this._theme;
  }
  /**
   * Set the theme of the editor.
   * Can be either "light" or "dark".
   *
   * The default is "light".
   */
  public set theme(value: "light" | "dark") {
    this._theme = value;
    if (this._mainContainer) {
      this._mainContainer.setAttribute("data-theme", value);
    }
  }

  private _settings: AnnotationEditorSettings = {
    renderOnSave: true,
    rendererSettings: {
      naturalSize: false,
      imageType: "image/png",
      imageQuality: 1,
      markersOnly: false,
    },
  };
  /**
   * The settings for the editor.
   * This is used to configure the editor behavior.
   */
  public get settings() {
    return this._settings;
  }

  constructor() {
    super();

    this._markerArea = new MarkerArea();

    this.addStyles = this.addStyles.bind(this);
    this.createLayout = this.createLayout.bind(this);
    this.addMarkerArea = this.addMarkerArea.bind(this);
    this.addToolbar = this.addToolbar.bind(this);
    this.addToolbox = this.addToolbox.bind(this);
    this.attachEvents = this.attachEvents.bind(this);
    this.restoreState = this.restoreState.bind(this);
    this.handleSaveButtonClick = this.handleSaveButtonClick.bind(this);
    this.handleCloseButtonClick = this.handleCloseButtonClick.bind(this);

    this.closeOpenDropdowns = this.closeOpenDropdowns.bind(this);

    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.addStyles();
    this.createLayout();
    this.addMarkerArea();
    this.addToolbar();
    this.addToolbox();
    this.attachEvents();
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
      "grid grid-rows-[auto_1fr_auto] w-full h-full bg-base-200 overflow-hidden";

    this._toolbarContainer = document.createElement("div");
    this._toolbarContainer.id = "toolbarContainer";
    this._toolbarContainer.className = "bg-base-100 z-10";

    this._mainContainer.appendChild(this._toolbarContainer);

    this._markerAreaContainer = document.createElement("div");
    this._markerAreaContainer.id = "markerAreaContainer";
    this._markerAreaContainer.className = "flex overflow-hidden bg-base-200";

    this._mainContainer.appendChild(this._markerAreaContainer);

    this._toolboxContainer = document.createElement("div");
    this._toolboxContainer.id = "toolboxContainer";
    this._toolboxContainer.className = "bg-base-100";

    this._mainContainer.appendChild(this._toolboxContainer);

    this.shadowRoot?.appendChild(this._mainContainer);
  }

  private addMarkerArea() {
    if (this.targetImage && this._markerAreaContainer && this._markerArea) {
      this._markerArea.targetImage = this.targetImage;

      // Apply auto-zoom settings
      if (this._settings.autoZoomIn !== undefined) {
        this._markerArea.autoZoomIn = this._settings.autoZoomIn;
      }
      if (this._settings.autoZoomOut !== undefined) {
        this._markerArea.autoZoomOut = this._settings.autoZoomOut;
      }

      this._markerAreaContainer.appendChild(this._markerArea);
    }
  }

  private addToolbar() {
    if (
      this._toolbar === undefined &&
      this._toolbarContainer &&
      this._markerArea
    ) {
      this._toolbar = new EditorToolbar(this._markerArea);
      this._toolbar.onSaveButtonClick = this.handleSaveButtonClick;
      this._toolbar.onCloseButtonClick = this.handleCloseButtonClick;
      this._toolbarContainer.appendChild(this._toolbar.getUI());
    }
  }

  private async handleSaveButtonClick() {
    if (this._markerArea) {
      const state = this._markerArea.getState();

      let renderedImage: string | undefined;

      if (this.settings.renderOnSave) {
        const renderer = new Renderer();
        renderer.targetImage = this.targetImage;
        renderer.naturalSize =
          this.settings.rendererSettings?.naturalSize ?? false;
        renderer.markersOnly =
          this.settings.rendererSettings?.markersOnly ?? false;
        renderer.width = this.settings.rendererSettings?.width;
        renderer.height = this.settings.rendererSettings?.height;
        renderer.imageType =
          this.settings.rendererSettings?.imageType ?? "image/png";
        renderer.imageQuality =
          this.settings.rendererSettings?.imageQuality ?? 1;
        renderedImage = await renderer.rasterize(state);
      }

      this.dispatchEvent(
        new CustomEvent<AnnotationEditorRenderEventData>("editorsave", {
          detail: { annotationEditor: this, state, dataUrl: renderedImage },
        })
      );
    }
  }

  private handleCloseButtonClick() {
    this.dispatchEvent(
      new CustomEvent<AnnotationEditorEventData>("editorclose", {
        detail: { annotationEditor: this },
      })
    );
  }

  private addToolbox() {
    if (
      this._toolbox === undefined &&
      this._toolboxContainer &&
      this._markerArea
    ) {
      this._toolbox = new EditorToolbox(this._markerArea);
      this._toolboxContainer.appendChild(this._toolbox.getUI());
    }
  }

  private attachEvents() {
    this._mainContainer?.addEventListener("click", (event) => {
      let dropDownTarget: HTMLDetailsElement | null = null;

      if (event.target instanceof Element) {
        dropDownTarget = event.target?.closest(".dropdown");
      }
      if (dropDownTarget instanceof HTMLDetailsElement) {
        this.closeOpenDropdowns(dropDownTarget);
      } else {
        this.closeOpenDropdowns();
      }
    });
  }

  /**
   * Loads a previously saved annotation into the editor.
   *
   * @param state The state to restore.
   */
  public restoreState(state: AnnotationState) {
    if (this._markerArea) {
      this._markerArea.restoreState(state);
    }
  }

  private closeOpenDropdowns(exception?: HTMLDetailsElement) {
    const openDropdowns =
      this._mainContainer?.querySelectorAll(".dropdown[open]");
    openDropdowns?.forEach((dropdown) => {
      if (dropdown !== exception) {
        dropdown.removeAttribute("open");
      }
    });
  }

  addEventListener<T extends keyof AnnotationEditorEventMap>(
    // the event name, a key of AnnotationEditorEventMap
    type: T,

    // the listener, using a value of AnnotationEditorEventMap
    listener: (this: AnnotationEditor, ev: AnnotationEditorEventMap[T]) => void,

    // any options
    options?: boolean | AddEventListenerOptions
  ): void;
  addEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions | undefined
  ): void;
  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions | undefined
  ): void {
    super.addEventListener(type, listener, options);
  }

  removeEventListener<T extends keyof AnnotationEditorEventMap>(
    // the event name, a key of AnnotationEditorEventMap
    type: T,

    // the listener, using a value of AnnotationEditorEventMap
    listener: (this: AnnotationEditor, ev: AnnotationEditorEventMap[T]) => void,

    // any options
    options?: boolean | EventListenerOptions
  ): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: boolean | EventListenerOptions | undefined
  ): void;
  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | EventListenerOptions | undefined
  ): void {
    super.removeEventListener(type, listener, options);
  }
}

if (
  window &&
  window.customElements &&
  window.customElements.get("mjsui-annotation-editor") === undefined
) {
  window.customElements.define("mjsui-annotation-editor", AnnotationEditor);
}
