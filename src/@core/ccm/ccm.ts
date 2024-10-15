import { logError, logWarning } from '../../service/logger';
import { AbsCommand } from './command';
import { TCommandFlagConfig } from './types';
import { parseArgsCCM } from './utils';

export default class CCM<C extends AbsCommand<TCommandFlagConfig>[]> {
    private _commands: Map<string, AbsCommand<any>>;

    constructor(commands: C) {
        this._commands = new Map();
        this._setCommands(commands);
    }

    private _setCommands(commands: C) {
        commands.forEach(c => {
            if (this._commands.has(c.commandName)) logWarning(`Command '${c.commandName}' already exists in configuration, skiping`);
            else {
                this._commands.set(c.commandName, c);
            }
        });
    }

    public execute(args: string[]): void {
        const parsedCommand = parseArgsCCM(args);
        const command = this._commands.get(parsedCommand.commandName);
        if (!command) {
            logError(`Command '${parsedCommand.commandName}' not found in configuration`);
            throw new Error('Unkown command');
        }

        command.exec(...args);
    }
}
