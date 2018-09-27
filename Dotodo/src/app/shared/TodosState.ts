import { State, Action, StateContext } from '@ngxs/store';
import { TodosStateModel } from './TodosModel';
import { UpdateText } from './TodosActions';
​
@State<TodosStateModel>({
    name: 'todos',
})
export class TodosState {
    @Action(UpdateText)
    onUpdateText( ctx: StateContext<TodosStateModel>, payload: UpdateText) {
        ctx.patchState({
            editorText: payload.text
        });
    }
}
