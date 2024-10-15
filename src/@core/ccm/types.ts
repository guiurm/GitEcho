export type TCommandFlagsStatus<b extends TCommandFlagConfig> = {
    [K in keyof b]: { active: boolean; value: TTypesValue<b[K]['type']> | null };
};

type TTypesValue<V extends string | undefined> = V extends 'string'
    ? string
    : V extends 'number'
      ? number
      : V extends 'boolean'
        ? boolean
        : null;

export type TCommandFlagConfig = {
    [K: string]: {
        type?: string; // 'string' | 'number' | 'boolean';
    };
};

export type TParsedFlag = { key: string; value: string | null };
export type TParsedCommand = { commandName: string; flags: TParsedFlag[]; values: string[] };
