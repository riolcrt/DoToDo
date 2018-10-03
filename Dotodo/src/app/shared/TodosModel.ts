export interface TodosStateModel {
    editorText: string;
    todos: TodoItem[];

}

export enum TodoItemTypeEnum { Annotation, Group, Todo, TodoCanceled, TodoDone, TodoEllapsed }
export enum TagTypeEnum {
    Started = '@started',
    Cancelled = '@cancelled',
    Done = '@done',
    Lasted = '@lasted',
    Wasted = '@wasted'
}

export enum ShortcutValidationErrorEnum {
    only_task_can_have_tags,
    done_can_not_be_cancelled,
    cancelled_can_not_be_done,
    finished_can_not_be_started,
}

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
