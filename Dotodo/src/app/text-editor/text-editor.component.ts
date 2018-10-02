import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateText } from '../shared/TodosActions';
import { Observable } from 'rxjs';
import { TodoItem, TodoItemTypeEnum, TagTypeEnum } from '../shared/TodosModel';
import { TodosState } from '../shared/TodosState';
import { TODOITEM_SHORTCUTS } from '../constants/shortcuts';

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

  onTextInput (event: TextEvent) {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    this.dispatchUpdate(target.value);
  }
  getLineEndPosition(caretPosition: number, text: string): number {
    const nextLinebreakPosition = text.substr(caretPosition, text.length).indexOf('\n');
    return  nextLinebreakPosition !== -1 ? caretPosition + nextLinebreakPosition : text.length;
  }

  selectTagInLine(line: string, tag: string): {startPosition: number, endPosition: number } {
    const startPosition = line.indexOf(tag);
    const currentTag = line.substr(startPosition + 1).split('@')[0];
    const tagHasDate = (x: string) => x.indexOf(')') !== -1;
    const endPosition = tagHasDate(currentTag) ? startPosition + 1 + currentTag.indexOf(')') : tag.length;

    return startPosition === -1 ? null : { startPosition, endPosition};
  }
  onShortcut(event: KeyboardEvent ) {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    const currentText: string = target.value;
    const caretPosition: number = target.selectionStart;

    if (event.altKey || event.code === 'Tab') {
      event.preventDefault();
    }

    TODOITEM_SHORTCUTS.forEach(x => {
      if (event.key === x.key) {
        const lineEndPosition = this.getLineEndPosition(caretPosition, currentText);
        switch (x.action) {
          case TagTypeEnum.Done:
            target.value = target.value.slice(0, lineEndPosition) + ' @done' + target.value.slice(lineEndPosition);
            break;
          case TagTypeEnum.Start:
            break;
          case TagTypeEnum.Cancel:
            break;
        }
        target.selectionStart = caretPosition;
        target.selectionEnd = caretPosition;
        this.dispatchUpdate(target.value);
      }
    });
  }
  dispatchUpdate(payload: string) {
    this.state.dispatch(new UpdateText(payload));
  }
}
