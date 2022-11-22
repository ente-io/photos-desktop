import { typedIpcRenderer } from '../ipc';

import { AppUpdateInfo } from '../types';

export const sendNotification = async (content: string) => {
    await typedIpcRenderer.invoke('send-notification', content);
};
export const showOnTray = async (content: {
    // eslint-disable-next-line camelcase
    export_progress?: any;
    // eslint-disable-next-line camelcase
    retry_export?: any;
    paused?: any;
}) => {
    await typedIpcRenderer.invoke('update-tray', content);
};
export const reloadWindow = async () => {
    await typedIpcRenderer.invoke('reload-window');
};

export const registerUpdateEventListener = (
    showUpdateDialog: (updateInfo: AppUpdateInfo) => void
) => {
    typedIpcRenderer.removeAllListeners('show-update-dialog');
    typedIpcRenderer.on(
        'show-update-dialog',
        (_, updateInfo: AppUpdateInfo) => {
            showUpdateDialog(updateInfo);
        }
    );
};

export const updateAndRestart = async () => {
    await typedIpcRenderer.invoke('update-and-restart');
};

export const skipAppVersion = async (version: string) => {
    await typedIpcRenderer.invoke('skip-app-version', version);
};
