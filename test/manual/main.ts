import "./style.css";
import sampleImage from "./images/sample-image.png";
import { AnnotationEditor, AnnotationViewer } from "./../../src/lib/index";
import sampleAnnotation from "./sample-state.json";

const targetImage = document.createElement("img");
targetImage.src = sampleImage;

const editor = new AnnotationEditor();
editor.targetImage = targetImage;
//editor.theme = "dark";
// editor.settings.renderOnSave = true;
editor.settings.rendererSettings.markersOnly = true;
// editor.settings.rendererSettings.imageType = "image/jpeg";
// editor.settings.rendererSettings.imageQuality = 0.1;
// editor.settings.rendererSettings.naturalSize = true;
// editor.settings.rendererSettings.width = 50;
// editor.settings.rendererSettings.height = 600;
editor.settings.autoZoomIn = true;
editor.settings.autoZoomOut = true;

editor.addEventListener("editorsave", (event) => {
  console.log("Editor state:", event.detail.state);
  viewer.show(event.detail.state);
  const dataUrl = event.detail.dataUrl;
  if (dataUrl) {
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `annotation.${
      editor.settings.rendererSettings.imageType === "image/jpeg"
        ? "jpg"
        : "png"
    }`;
    link.innerText = "Download";
    link.click();
  }
});
editor.addEventListener("editorclose", () => {
  document.querySelector<HTMLDivElement>("#editorDiv")!.removeChild(editor);

  console.log("Editor closed");
});
editor.markerArea.addEventListener("markercreate", (event) => {
  console.log("Marker created:", event.detail.markerEditor.marker.typeName);
});

const viewer = new AnnotationViewer();
viewer.targetImage = targetImage;
viewer.theme = "dark";

viewer.markerView.addEventListener("markerover", (event) => {
  console.log("Marker hovered:", event.detail.marker.typeName);
});

document.querySelector<HTMLDivElement>("#editorDiv")!.appendChild(editor);
document.querySelector<HTMLDivElement>("#viewerDiv")!.appendChild(viewer);

document
  .querySelector<HTMLButtonElement>("#toggleTheme")!
  .addEventListener("click", () => {
    editor.theme = editor.theme === "light" ? "dark" : "light";
    viewer.theme = viewer.theme === "light" ? "dark" : "light";
  });

editor.restoreState(sampleAnnotation);
