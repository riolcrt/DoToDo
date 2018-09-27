export class UpdateText {
    static readonly type = '[Editor] Text Update';
    constructor(public text: string) {}
}
