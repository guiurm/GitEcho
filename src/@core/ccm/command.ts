import { TCommandFlagConfig, TCommandFlagsStatus } from './types';
import { parseArgsCCM } from './utils';

export abstract class AbsCommand<F extends TCommandFlagConfig = {}> {
    public abstract readonly commandName: string;
    protected readonly _flags: F;

    constructor(flags: F) {
        this._flags = flags;
    }

    public get flagOptions() {
        return Object.keys(this._flags) as (keyof typeof this._flags)[];
    }

    public get help() {
        return `${this.commandName} '${this.flagOptions.join("', '")}'`;
    }

    private _checkFlag(flag: string) {
        if (!this.flagOptions.includes(flag)) throw new Error(`unkown flag: ${flag}`);
    }
    public exec(...args: string[]): void {
        const parsedArgs = parseArgsCCM(args);

        const flags = {} as TCommandFlagsStatus<F>;
        for (const key in this._flags) {
            flags[key] = { active: false, value: null };
        }

        parsedArgs.flags.forEach(({ key, value }) => {
            this._checkFlag(key);
            const { type } = this._flags[key];
            let v = null;
            if (!value) {
                flags[key as keyof typeof flags] = { active: true, value: v };
                return;
            }

            switch (type) {
                case 'boolean':
                    v = JSON.parse(value);
                    break;
                case 'number':
                    v = parseFloat(value);
                    break;
                case 'string':
                    v = value;
                    break;
            }

            flags[`${key}` as keyof TCommandFlagsStatus<F>] = { active: true, value: v };
        });
        this._play(flags, parsedArgs.values);
    }

    protected abstract _play(flags: TCommandFlagsStatus<F>, args: string[]): void;
}

export class CustomCommand<F extends TCommandFlagConfig> extends AbsCommand<F> {
    protected _play(flags: TCommandFlagsStatus<F>, args: string[]): void {
        throw new Error('Method not implemented.');
    }
    public commandName: string;
    constructor(command: string, flags: F) {
        super(flags);
        this.commandName = command;
    }
}
