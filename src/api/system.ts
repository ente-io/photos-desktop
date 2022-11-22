import { typedIpcRenderer } from '../ipc';

import { AppUpdateInfo } from '../types';

export const sendNotification = (content: string) => {
    typedIpcRenderer.invoke('send-notification', content);
};
export const showOnTray = (content: {
    // eslint-disable-next-line camelcase
    export_progress?: any;
    // eslint-disable-next-line camelcase
    retry_export?: any;
    paused?: any;
}) => {
    typedIpcRenderer.invoke('update-tray', content);
};
export const reloadWindow = () => {
    typedIpcRenderer.invoke('reload-window');
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

export const updateAndRestart = () => {
    typedIpcRenderer.send('update-and-restart');
};

export const skipAppVersion = (version: string) => {
    typedIpcRenderer.send('skip-app-version', version);
};
