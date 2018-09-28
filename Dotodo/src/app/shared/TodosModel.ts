export interface TodosStateModel {
    editorText: string;
    todos: TodoItem[];

}

export enum TodoItemTypeEnum { Annotation, Group, Todo, TodoCanceled, TodoDone }
export enum TodoItemTagTypeEnum { Critical, Started, Done, Canceled  }

export interface TodoItem {
    text: string;
    end: number;
    indentation: number;
    type: string[];
    tags: TodoItemTag[];
}

export interface TodoItemTag {
    text: string;
    type: TodoItemTagTypeEnum;
}
