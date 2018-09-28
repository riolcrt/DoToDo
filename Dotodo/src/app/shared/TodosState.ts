import { State, Action, StateContext, Selector, } from '@ngxs/store';
import { TodosStateModel, TodoItem, TodoItemTypeEnum } from './TodosModel';
import { UpdateText } from './TodosActions';
import { regexes } from '../regex';
​
@State<TodosStateModel>({
    name: 'todos',
})
export class TodosState  {
    @Selector()
    static GetTodoItems(state: TodosStateModel) {
        return state.todos;
    }

    @Action(UpdateText)
    onUpdateText( ctx: StateContext<TodosStateModel>, payload: UpdateText) {
        const items = payload.text.split('\n');

        const itemsMaped = items.map(item => {
            return {
                text: item,
                type: this.parseType(item)
            } as TodoItem;
        });

        ctx.patchState({
            editorText: payload.text,
            todos: itemsMaped
        });
    }

    parseType (text: string): TodoItemTypeEnum {
        if (regexes.todo.test(text) === true) {
            return TodoItemTypeEnum.Todo;
        }

        if (regexes.todoCancelled.test(text) === true) {
            return TodoItemTypeEnum.TodoDone;
        }

        if (regexes.todoDone.test(text) === true) {
            return TodoItemTypeEnum.TodoCanceled;
        }

        if (regexes.todoBox.test(text) === true) {
            return TodoItemTypeEnum.Group;
        }

        return TodoItemTypeEnum.Annotation;
    }
}
