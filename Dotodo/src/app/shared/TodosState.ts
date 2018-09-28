import { State, Action, StateContext, Selector, } from '@ngxs/store';
import { TodosStateModel, TodoItem, TodoItemTypeEnum } from './TodosModel';
import { UpdateText, ShortCutPressed } from './TodosActions';
import { regexes } from '../regex';
import { text } from '@angular/core/src/render3/instructions';
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
                type: this.parseType(item, regexes)
            } as TodoItem;
        });

        ctx.patchState({
            editorText: payload.text,
            todos: itemsMaped
        });
    }

    parseType (textToTest: string, regex: any): string[] {
        return  Object.keys(regex).filter( x => textToTest.match(regex[x]) !== null);
    }

    @Action(ShortCutPressed)
    onShortcutPressed( ctx: StateContext<TodosStateModel>, payload: ShortCutPressed) {
        const currentText = ctx.getState().editorText;
        const currentLine = currentText.substr(0, payload.caretPosition).split('\n').length;
        console.log (ctx.getState().todos[currentLine]);
    }
}
