import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateText, ShortCutPressed } from '../shared/TodosActions';
import { Observable } from 'rxjs';
import { TodoItem, TodoItemTypeEnum } from '../shared/TodosModel';
import { TodosState } from '../shared/TodosState';
import { store } from '@angular/core/src/render3/instructions';
import { stat } from 'fs';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {
  public todoType: typeof TodoItemTypeEnum = TodoItemTypeEnum;
  public todos$: Observable<TodoItem[]> = this.state.select(TodosState.GetTodoItems);

  constructor (private state: Store, private el: ElementRef) {}

  ngOnInit() {
    const textArea: HTMLTextAreaElement = this.el.nativeElement.querySelector('textarea');
    this.dispatchUpdate(textArea.value);
  }

  onTextInput (e: TextEvent) {
    const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
    this.dispatchUpdate(target.value);
  }

  onShortcut(e: KeyboardEvent ) {
    const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
    if (e.altKey || e.code === 'Tab') {
      switch (e.key) {
        case 'Tab':
          if (e.shiftKey) {
            console.log ('decrease indent');
            this.state.dispatch(new ShortCutPressed(target.selectionStart));
            break;
          }
          console.log ('increase indent');
          break;
        case 'd':
          console.log ('set as done');
          console.log (target.selectionStart);
          break;
        case 's':
          console.log ('set as started');
          break;
        case 'c':
          console.log ('set as cancelled');
          break;
      }
      e.preventDefault();
    }
  }

  dispatchUpdate(payload: string) {
    this.state.dispatch(new UpdateText(payload));
  }
}
