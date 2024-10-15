import { TCommandFlagConfig, TParsedCommand } from './types';

export const parseArgsCCM = (args: string[]): TParsedCommand => {
    //logMessage(args);

    if (args.length === 0) {
        console.log('No arguments provided.');
        //throw new Error();
    }

    const commandName = args[0];
    const flags: { key: string; value: string | null }[] = [];
    const values: string[] = [];

    for (let i = 1; i < args.length; i++) {
        const arg = args[i];

        if (arg.startsWith('--') || arg.startsWith('-')) {
            const [key, value = null] = arg.split('='); //arg.replace(/^--?/, '').split('=');
            flags.push({ key, value });
        } else {
            values.push(arg);
        }
    }

    return {
        commandName,
        flags,
        values,
    };
};

type TRemoveReadonly<V> = {
    -readonly [K in keyof V]: V[K] extends Object ? TRemoveReadonly<V[K]> : V[K];
} & ({} | {});

export const CCMGenerateFlagConf = <F extends TCommandFlagConfig>(flags: F = {} as F): TRemoveReadonly<F> => {
    return flags;
};
