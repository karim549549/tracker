import { contextBridge, ipcRenderer } from "electron";
import type { AppData, TrackerBridge } from "../shared/types";

const bridge: TrackerBridge = {
  loadBoard: () => ipcRenderer.invoke("tracker:load"),
  saveBoard: (data: AppData) => ipcRenderer.invoke("tracker:save", data),
};

contextBridge.exposeInMainWorld("tracker", bridge);
