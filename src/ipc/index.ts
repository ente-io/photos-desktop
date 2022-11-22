import { TypedIpcMain, TypedIpcRenderer } from 'electron-typed-ipc';
import { IPCEvents, IPCCommands } from '../types/ipc';

import { ipcMain, ipcRenderer } from 'electron';

export const typedIpcMain = ipcMain as TypedIpcMain<IPCEvents, IPCCommands>;
export const typedIpcRenderer = ipcRenderer as TypedIpcRenderer<
    IPCEvents,
    IPCCommands
>;
