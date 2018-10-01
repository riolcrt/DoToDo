import { TagTypeEnum, TodoItem } from './TodosModel';

export class UpdateText {
    static readonly type = '[Editor] Text Update';
    constructor(public text: string) {}
}


