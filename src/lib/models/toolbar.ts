import { MarkerBase } from "@markerjs/markerjs3";

export type ToolbarAction =
  | "select"
  | "delete"
  | "delete-all"
  | "save"
  | "download"
  | "close"
  | "undo"
  | "redo"
  | "zoom-in"
  | "zoom-out"
  | "zoom-reset"
  | "zoom-to-fit";

export type MarkerTypeItem = {
  icon: string;
  name: string;
  markerType: typeof MarkerBase;
};

export type MarkerTypeGroup = {
  name: string;
  markerTypes: MarkerTypeItem[];
};

export type MarkerTypeList = Array<MarkerTypeGroup>;
