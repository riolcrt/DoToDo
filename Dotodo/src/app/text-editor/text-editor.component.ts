import { Component } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateText } from '../shared/TodosActions';
import { Observable } from 'rxjs';
import { TodoItem } from '../shared/TodosModel';
import { TodosState } from '../shared/TodosState';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent  {
  constructor (private state: Store) {
    this.todos$.subscribe(x => console.log ('recibido mediante subscripcion', x));
  }

  public todos$: Observable<TodoItem[]> = this.state.select(TodosState.GetTodoItems);

  onTextInput (e: TextEvent) {
    const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
    this.state.dispatch(new UpdateText(target.value));
  }
}
