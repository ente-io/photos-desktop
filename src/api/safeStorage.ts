import { safeStorageStore } from '../stores/safeStorage.store';
import { logError } from '../services/logging';
import { typedIpcRenderer } from '../types/ipc';

export async function setEncryptionKey(encryptionKey: string) {
    try {
        const encryptedKey: Buffer = await typedIpcRenderer.invoke(
            'safeStorage-encrypt',
            encryptionKey
        );
        const b64EncryptedKey = Buffer.from(encryptedKey).toString('base64');
        safeStorageStore.set('encryptionKey', b64EncryptedKey);
    } catch (e) {
        logError(e, 'setEncryptionKey failed');
        throw e;
    }
}

export async function getEncryptionKey(): Promise<string> {
    try {
        const b64EncryptedKey = safeStorageStore.get('encryptionKey');
        if (b64EncryptedKey) {
            const keyBuffer = Buffer.from(b64EncryptedKey, 'base64');

            return await typedIpcRenderer.invoke(
                'safeStorage-decrypt',
                keyBuffer
            );
        }
    } catch (e) {
        logError(e, 'setEncryptionKey failed');
        throw e;
    }
}
