export class UpdateText {
    static readonly type = '[Editor] Text Update';
    constructor(public text: string) {}
}

export class ShortCutPressed {
    static readonly type = '[Editor] ShortCutPressed';
    constructor(public caretPosition: number) {}
}
