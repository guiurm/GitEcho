import { ExecException, execSync } from 'child_process';
import { join } from 'path';
import { AbsCommand } from '../@core/ccm/command';
import { TCommandFlagsStatus } from '../@core/ccm/types';
import { CCMGenerateFlagConf } from '../@core/ccm/utils';
import { writeFile } from '../service/file';
import MdCreator from '../service/MdCreator';
import { obtainPackage } from './version';

const acceptedCommitTypes = ['build', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test'] as const;

type TCommitInfo = {
    hash: string;
    header: string;
    body: string[];
    type: (typeof acceptedCommitTypes)[number] | 'other';
    scope: string;
};

type TCommitGroup = Map<TCommitInfo['type'], TCommitInfo[]>;

const gitLogFlags = CCMGenerateFlagConf({
    '--version': { type: 'string' },
    '--template-name': {
        type: 'string',
    },
} as const);

const getCommitBody = (hash: string): string[] => {
    // git log --pretty=format:"%n %h => %s %b <%cn> %aI %H, %cn %ar %n"
    try {
        let gitBody = execSync(`git show -s --format=%b ${hash}`).toString();

        gitBody = gitBody.replace('\n ', '\n');
        gitBody = gitBody.replace(' \n', '\n');
        gitBody = gitBody.replace('\n -', '\n');
        gitBody = gitBody.replace('\n- ', '\n');

        return gitBody
            .split('\n')
            .map(s => {
                let newS = s;
                if (newS.startsWith('- ')) newS = newS.slice(2);
                if (newS.startsWith('-')) newS = newS.slice(1);
                if (newS.startsWith(' ')) newS = newS.slice(1);
                return newS;
            })
            .filter(s => s !== '');
    } catch (error) {
        throw `git-log Error: ${(error as ExecException).message}`;
    }
};
const getCommitTarget = (header: string, commitType: TCommitInfo['type']) => {
    if (header.indexOf(':') === -1) return { target: '', comment: header };

    let [target, ...rest] = header.replace(commitType, '').split(': ');
    target = target.replace(/[()]/g, '');

    return { target, comment: rest.join(':') };
};
const getCommit = (commit: string): TCommitInfo => {
    const [hash, ...rest] = commit.split(' ');
    const header = rest.join(' ');
    const commitInfo: TCommitInfo = {
        body: getCommitBody(hash),
        hash,
        header,
        type: 'other',
        scope: '',
    };
    for (let index = 0; index < acceptedCommitTypes.length; index++) {
        const cAccepted = acceptedCommitTypes[index];
        if (commitInfo.header.startsWith(cAccepted)) {
            commitInfo.type = cAccepted;
            const { comment, target } = getCommitTarget(header, cAccepted);
            commitInfo.scope = target;
            commitInfo.header = comment;
            break;
        }
    }
    return commitInfo;
};

const listCommits = (): TCommitGroup => {
    try {
        const list = execSync('git log --pretty=format:"%h %s"').toString().split('\n');
        const commits = list.map(c => getCommit(c));

        const commitsGroup: Map<TCommitInfo['type'], TCommitInfo[]> = new Map();

        commits.forEach(cCommit => {
            const group = commitsGroup.get(cCommit.type) ?? [];
            group.push(cCommit);
            commitsGroup.set(cCommit.type, group);
        });

        return commitsGroup;
    } catch (error) {
        throw `git-log Error: ${(error as ExecException).message}`;
    }
};

const generateMDContent = (commits: TCommitGroup, version: string, message: string) => {
    const md = new MdCreator();

    md.addH1(version).addH4(message);

    commits.forEach((commit, type) => {
        md.addH3(type + ':');
        commit.forEach(({ body, hash, header, scope }) => {
            md.addText(scope !== '' ? ` - ${scope}: ` : ' - ').addText(`${header} (#${hash})\n`);
            if (body.length !== 0) body.forEach(line => md.tab().addText(`- ${line}`).newLine());
        });
    });

    return md.md;
};

export default class GitLog extends AbsCommand<typeof gitLogFlags> {
    public commandName: string;

    constructor() {
        super(gitLogFlags);
        this.commandName = 'git-log';
    }

    protected _play(flags: TCommandFlagsStatus<typeof gitLogFlags>, args: string[]): void {
        const commits = listCommits();
        let version = flags['--version'].value;
        const template = flags['--template-name'].value ?? 'v[$version]';
        if (version === null) {
            const pkg = obtainPackage();
            version = pkg.version as string;
        }
        version = template.replace('[$version]', version);
        console.log(version);

        const message = args.length !== 0 ? args.join(' ') : `Realease ${version}`;

        const md = generateMDContent(commits, version, message);
        writeFile(join(process.cwd(), `${version}.md`), md);
    }
}
