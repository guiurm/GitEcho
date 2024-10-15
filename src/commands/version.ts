import { join } from 'path';
import { AbsCommand } from '../@core/ccm/command';
import { TCommandFlagsStatus } from '../@core/ccm/types';
import { CCMGenerateFlagConf } from '../@core/ccm/utils';
import { readFile, writeFile } from '../service/file';

const modifyVersion = (version: string, indexTarget: 0 | 1 | 2) =>
    version
        .split('.')
        .map((n, i) => (i === indexTarget ? parseInt(n) + 1 : i > indexTarget ? 0 : parseInt(n)))
        .join('.');

export const obtainPackage = (): Record<string, any> => {
    const path = join(process.cwd(), 'package.json');
    return JSON.parse(readFile(path));
};

const writePackage = (data: string) => {
    writeFile(join(process.cwd(), 'package.json'), data);
};

export const flagsVersion = CCMGenerateFlagConf({
    '--mayor': { type: 'string' },
    '--minor': { type: 'string' },
    '--fix': { type: 'string' },
    '--wip': { type: 'string' },
});

export default class Version extends AbsCommand<typeof flagsVersion> {
    public readonly commandName: 'version';

    constructor() {
        super(flagsVersion);
        this.commandName = 'version';
    }

    protected _play(flags: TCommandFlagsStatus<typeof flagsVersion>, args: string[]): void {
        const ammountActiveFlags = Object.keys(flags).filter(f => flags[f as keyof typeof flags].active).length;
        if (ammountActiveFlags > 1) throw new Error('Only one flag by command');

        const pkg = obtainPackage();

        if (flags['--mayor'].active) pkg.version = modifyVersion(pkg.version, 0);
        if (flags['--minor'].active) pkg.version = modifyVersion(pkg.version, 1);
        if (flags['--fix'].active) pkg.version = modifyVersion(pkg.version, 2);
        //if(flags['--wip'].active)pkg.version=modifyVersion(pkg.version,0)
        writePackage(JSON.stringify(pkg, null, 4) + '\r\n');
    }
}
