const { crashReporter } = require('electron');

export function initCrashPad() {
    crashReporter.start({ uploadToServer: false });
}
