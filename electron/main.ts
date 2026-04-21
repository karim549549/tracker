import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import { readAppData, writeAppData } from "./fileStore";
import type { AppData } from "../shared/types";

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    frame: true,
    backgroundColor: "#0a0a0a",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, "../../../out/index.html"));
  } else {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
  }
}

ipcMain.handle("tracker:load", async () => {
  try {
    const data = await readAppData();
    return { ok: true, data };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

ipcMain.handle("tracker:save", async (_event, data: AppData) => {
  try {
    await writeAppData(data);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
