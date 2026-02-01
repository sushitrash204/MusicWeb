import { processAudioFile } from '@unimusic/chromaprint';

export const generateFingerprint = async (file: File): Promise<string | null> => {
    try {
        // 1. Read file as ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();

        // 2. Process using @unimusic/chromaprint (WASM)
        const generator = processAudioFile(arrayBuffer);

        const result = await generator.next();
        if (!result.done && result.value) {
            return result.value;
        }

        return null;

    } catch (error) {
        console.error('Error generating fingerprint:', error);
        return null;
    }
};
