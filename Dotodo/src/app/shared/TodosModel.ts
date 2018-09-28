export interface TodosStateModel {
    editorText: string;
    todos: TodoItem[];

}

export interface TodoItemTypeEnum { Annotation; Group; Todo; }
export interface TodoItemTagTypeEnum { Critical; Started; Done; Canceled;  }

export interface TodoItem {
    text: string;
    indentation: number;
    type: TodoItemTypeEnum;
    tags: TodoItemTag[];
}

export interface TodoItemTag {
    text: string;
    type: TodoItemTagTypeEnum;
}
