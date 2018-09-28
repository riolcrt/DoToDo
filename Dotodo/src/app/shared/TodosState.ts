import { State, Action, StateContext, Selector } from '@ngxs/store';
import { TodosStateModel, TodoItem } from './TodosModel';
import { UpdateText } from './TodosActions';
​
@State<TodosStateModel>({
    name: 'todos',
})
export class TodosState {
    @Selector()
    static GetTodoItems(state: TodosStateModel) {
        return state.todos;
    }


    @Action(UpdateText)
    onUpdateText( ctx: StateContext<TodosStateModel>, payload: UpdateText) {
        const items = payload.text.split('\n');

        const itemsMaped = items.map(item => {
            return {
                text: item
            } as TodoItem;
        });

        ctx.patchState({
            editorText: payload.text,
            todos: itemsMaped
        });
    }
}
