import { readdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { extname } from 'path';
import { logError } from './logger';

export const readDirectory = (path: string): string[] => {
    try {
        return readdirSync(path, { recursive: false }) as string[];
    } catch (error) {
        logError(`Error reading directory: '${path}'`);
        logError(`Reason: "${(error as Error).message}"`);
        return [];
    }
};

export const listFilesFromDir = (path: string, extensions: string[]) => {
    const ext = new Set(extensions.map(cExt => (cExt.indexOf('.') !== -1 ? cExt : `.${cExt}`)));
    const files = readDirectory(path);
    return files.filter(cFile => ext.has(extname(cFile)));
};

export const removeFile = (path: string) => {
    try {
        unlinkSync(path);
    } catch (error) {
        logError(`Error removeing file "${path}"`);
        logError(`Reason: "${(error as Error).message}"`);
    }
};

export const readFile = (path: string) => {
    return readFileSync(path, 'utf8');
};

export const writeFile = (path: string, data: string) => {
    writeFileSync(path, data);
};
