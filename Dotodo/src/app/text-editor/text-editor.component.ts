import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateText } from '../shared/TodosActions';
import { Observable } from 'rxjs';
import { TodoItem, TodoItemTypeEnum } from '../shared/TodosModel';
import { TodosState } from '../shared/TodosState';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {
  public todoType: typeof TodoItemTypeEnum = TodoItemTypeEnum;
  public todos$: Observable<TodoItem[]> = this.state.select(TodosState.GetTodoItems);

  constructor (private state: Store, private el: ElementRef) {
    this.todos$.subscribe(x => console.log ('recibido mediante subscripcion', x));
  }

  ngOnInit() {
    const textArea: HTMLTextAreaElement = this.el.nativeElement.querySelector('textarea');
    this.dispatchUpdate(textArea.value);
  }

  onTextInput (e: TextEvent) {
    const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
    this.dispatchUpdate(target.value);
  }

  dispatchUpdate(payload: string) {
    this.state.dispatch(new UpdateText(payload));
  }
}
