import { typedIpcRenderer } from '../types/ipc';
import { isPlatformMac } from '../utils/preload';

export async function convertHEIC(fileData: Uint8Array): Promise<Uint8Array> {
    if (!isPlatformMac()) {
        throw Error('native heic conversion only supported on mac');
    }
    const convertedFileData = await typedIpcRenderer.invoke(
        'convert-heic',
        fileData
    );
    return convertedFileData;
}
