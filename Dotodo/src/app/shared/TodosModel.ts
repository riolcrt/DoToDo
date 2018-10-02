export interface TodosStateModel {
    editorText: string;
    todos: TodoItem[];

}

export enum TodoItemTypeEnum { Annotation, Group, Todo, TodoCanceled, TodoDone }
export enum TagTypeEnum {  Started, Cancelled, Done  }

export interface TodoItem {
    text: string;
    end: number;
    indentation: number;
    type: string[];
    tags: TodoItemTag[];
}

export interface TodoItemTag {
    date: Date;
    type: TagTypeEnum;
}
