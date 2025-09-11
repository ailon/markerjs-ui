import {
  CalloutMarkerEditor,
  CaptionFrameMarkerEditor,
  FreehandMarkerEditor,
  LinearMarkerEditor,
  MarkerArea,
  MarkerBase,
  MarkerBaseEditor,
  PolygonMarkerEditor,
  ShapeOutlineMarkerEditor,
} from "@markerjs/markerjs3";
import { ToolboxPanel } from "./ToolboxPanel";
import { defaultColors } from "./models/colors";
import { ColorPicker } from "./ColorPicker";

export class StrokeToolboxPanel extends ToolboxPanel {
  private _currentStrokeColor: string = defaultColors[0];
  private _currentStrokeStyle: string = "0";
  private _currentEditor?: MarkerBaseEditor<MarkerBase>;
  private _strokeWidthInput?: HTMLInputElement;
  private _strokeStylePicker?: HTMLDivElement;
  private _colorPicker?: ColorPicker;

  constructor(markerArea: MarkerArea, title: string, icon: string) {
    super(markerArea, title, icon);
    this.panelClasses = ["w-54", "-mr-8", "sm:mr-0"];

    this.getStrokeStyleVisual = this.getStrokeStyleVisual.bind(this);
    this.handleStrokeStyleClick = this.handleStrokeStyleClick.bind(this);
    this.updateButtonStates = this.updateButtonStates.bind(this);
  }

  protected override getContentUI() {
    const fieldset = document.createElement("fieldset");
    fieldset.className = "fieldset";

    const legend = document.createElement("legend");
    legend.className = "fieldset-legend";
    legend.innerText = this._title;
    fieldset.appendChild(legend);

    const widthLabel = document.createElement("label");
    widthLabel.className = "fieldset-label";
    widthLabel.innerText = "Width";
    fieldset.appendChild(widthLabel);

    this._strokeWidthInput = document.createElement("input");
    this._strokeWidthInput.type = "range";
    this._strokeWidthInput.min = "0";
    this._strokeWidthInput.max = "40";
    this._strokeWidthInput.value = "3";
    this._strokeWidthInput.step = "1";
    this._strokeWidthInput.className = "range";
    this._strokeWidthInput.addEventListener("input", () => {
      this.applyValues();
    });

    fieldset.appendChild(this._strokeWidthInput);

    // stroke style picker
    const strokeBlock = document.createElement("div");
    strokeBlock.className =
      "flex flex-row space-x-2 justify-between items-center";
    fieldset.appendChild(strokeBlock);

    const strokeStyleLabel = document.createElement("label");
    strokeStyleLabel.className = "fieldset-label";
    strokeStyleLabel.innerText = "Style";
    strokeBlock.appendChild(strokeStyleLabel);

    this._strokeStylePicker = document.createElement("div");
    this._strokeStylePicker.className = "join";
    strokeBlock.appendChild(this._strokeStylePicker);

    const solidStroke = document.createElement("button");
    solidStroke.className =
      "join-item btn btn-square btn-sm base-content p-1.5";
    solidStroke.setAttribute("data-style", "0");
    solidStroke.innerHTML = this.getStrokeStyleVisual("0");
    solidStroke.ariaLabel = "Solid";
    solidStroke.addEventListener("click", () => {
      this.handleStrokeStyleClick("0");
    });
    this._strokeStylePicker.appendChild(solidStroke);

    const dashedStroke = document.createElement("button");
    dashedStroke.className =
      "join-item btn btn-square btn-sm base-content p-1.5";
    dashedStroke.setAttribute("data-style", "4,4");
    dashedStroke.innerHTML = this.getStrokeStyleVisual("4,4");
    dashedStroke.ariaLabel = "Dashed";
    dashedStroke.addEventListener("click", () => {
      this.handleStrokeStyleClick("4,4");
    });
    this._strokeStylePicker.appendChild(dashedStroke);

    const dottedStroke = document.createElement("button");
    dottedStroke.className =
      "join-item btn btn-square btn-sm base-content p-1.5";
    dottedStroke.setAttribute("data-style", "2,3");
    dottedStroke.innerHTML = this.getStrokeStyleVisual("2,3");
    dottedStroke.ariaLabel = "Dotted";
    dottedStroke.addEventListener("click", () => {
      this.handleStrokeStyleClick("2,3");
    });
    this._strokeStylePicker.appendChild(dottedStroke);

    // color picker
    const colorLabel = document.createElement("label");
    colorLabel.className = "fieldset-label";
    colorLabel.innerText = "Stroke Color";
    fieldset.appendChild(colorLabel);

    this._colorPicker = new ColorPicker(defaultColors);
    this._colorPicker.onColorChange = (color: string) => {
      this._currentStrokeColor = color;
      this.applyValues();
    };

    fieldset.appendChild(this._colorPicker.getUI());

    return fieldset;
  }

  private getStrokeStyleVisual(strokeDasharray: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="butt" stroke-linejoin="round"><path stroke-dasharray="${strokeDasharray}" d="M2,12 H22" /></svg>`;
  }

  private handleStrokeStyleClick(strokeDasharray: string) {
    this._currentStrokeStyle = strokeDasharray;
    this.applyValues();
    this.updateButtonStates();
  }

  public override updateContent(): void {
    if (
      this._markerArea &&
      this._markerArea.currentMarkerEditor &&
      this._colorPicker
    ) {
      this._currentEditor = this._markerArea.currentMarkerEditor;

      if (this._strokeWidthInput) {
        this._strokeWidthInput.value =
          this._currentEditor.strokeWidth.toString();
      }

      this._currentStrokeStyle =
        this._markerArea.currentMarkerEditor.strokeDasharray || "0";

      this._currentStrokeColor =
        this._markerArea.currentMarkerEditor.strokeColor || defaultColors[0];
      this._colorPicker.currentColor = this._currentStrokeColor;
    }

    this.updateButtonStates();
  }

  public override applyValues() {
    if (this._markerArea && this._currentEditor) {
      if (this._strokeWidthInput) {
        this._currentEditor.strokeWidth = this._strokeWidthInput.valueAsNumber;
      }
      this._currentEditor.strokeDasharray = this._currentStrokeStyle;
      this._currentEditor.strokeColor = this._currentStrokeColor;
    }
  }

  public override updateVisibility(): void {
    const editor = this._markerArea.currentMarkerEditor;
    if (this._panel) {
      if (
        editor &&
        (editor.is(ShapeOutlineMarkerEditor) ||
          editor.is(LinearMarkerEditor) ||
          editor.is(CalloutMarkerEditor) ||
          editor.is(FreehandMarkerEditor) ||
          editor.is(PolygonMarkerEditor) ||
          editor.is(CaptionFrameMarkerEditor))
      ) {
        this._panel.classList.remove("hidden");
      } else {
        this._panel.classList.add("hidden");
      }
    }
  }

  private updateButtonStates() {
    const buttons = this._strokeStylePicker?.querySelectorAll("button");
    if (buttons) {
      buttons.forEach((button) => {
        button.classList.remove("btn-active");
        if (button.getAttribute("data-style") === this._currentStrokeStyle) {
          button.classList.add("btn-active");
        }
      });
    }
  }
}
