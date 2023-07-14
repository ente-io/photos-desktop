import { app } from 'electron';
import path from 'path';
import { RootFS, RootPromiseFS } from '../services/fs';

const ENTE_TEMP_DIRECTORY = 'ente';

const CHARACTERS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export async function getTempDirPath() {
    const tempDirPath = path.join(app.getPath('temp'), ENTE_TEMP_DIRECTORY);
    if (!RootFS.existsSync(tempDirPath)) {
        await RootPromiseFS.mkdir(tempDirPath);
    }
    return tempDirPath;
}

function generateTempName(length: number) {
    let result = '';

    const charactersLength = CHARACTERS.length;
    for (let i = 0; i < length; i++) {
        result += CHARACTERS.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}

export async function generateTempFilePath(formatSuffix: string) {
    let tempFilePath: string;
    do {
        const tempDirPath = await getTempDirPath();
        const namePrefix = generateTempName(10);
        tempFilePath = path.join(tempDirPath, namePrefix + '-' + formatSuffix);
    } while (RootFS.existsSync(tempFilePath));
    return tempFilePath;
}
