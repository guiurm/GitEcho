export default class MdCreator {
    private _md: string;

    constructor() {
        this._md = '';
    }

    public addH1(text: string): this {
        this._md += `# ${text}\n\n`;
        return this;
    }

    public addH2(text: string): this {
        this._md += `## ${text}\n\n`;
        return this;
    }

    public addH3(text: string): this {
        this._md += `### ${text}\n\n`;
        return this;
    }

    public addH4(text: string): this {
        this._md += `#### ${text}\n\n`;
        return this;
    }

    public addText(text: string): this {
        this._md += `${text}`;
        return this;
    }

    public newLine() {
        this._md += '\n';
        return this;
    }

    public tab() {
        this._md += '\t';
        return this;
    }

    public get md(): string {
        return this._md;
    }
}
