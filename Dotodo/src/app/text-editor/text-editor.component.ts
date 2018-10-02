import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateText } from '../shared/TodosActions';
import { Observable } from 'rxjs';
import { TodoItem, TodoItemTypeEnum, TagTypeEnum, ShortcutValidationErrorEnum } from '../shared/TodosModel';
import { TodosState } from '../shared/TodosState';
import { TODOITEM_SHORTCUTS } from '../constants/shortcuts';
import { regexes } from '../regex';
import { ShortcutValidationService } from '../shortcut-validation.service';
import { TextAreaParseService } from '../text-area-parse.service';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {
  public todoType: typeof TodoItemTypeEnum = TodoItemTypeEnum;
  public todos$: Observable<TodoItem[]> = this.state.select(TodosState.GetTodoItems);
  constructor (
    private state: Store,
    private validationService: ShortcutValidationService,
    private textAreaService: TextAreaParseService,
    private el: ElementRef) {
      Object.assign(Date.prototype, {
        toLocaleIsoString() {
          const tzOffset = (new Date()).getTimezoneOffset() * 60000;
          return (new Date(Date.now() - tzOffset)).toISOString().slice(0, -1);
        }
      });
  }

  ngOnInit() {
    const textArea: HTMLTextAreaElement = this.el.nativeElement.querySelector('textarea');
    this.dispatchUpdate(textArea.value);
  }

  onTextInput (event: TextEvent) {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    this.dispatchUpdate(target.value);
  }

  onShortcut(event: KeyboardEvent ) {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    const caretPosition: number = target.selectionStart;


    if (event.altKey || event.code === 'Tab') {
      if (TODOITEM_SHORTCUTS.some( x => x.key === event.key ))  {
        event.preventDefault();
      }
      TODOITEM_SHORTCUTS.forEach(x => {
        if (event.key === x.key) {
          this.updateTextAreaOnShortcut(target.value, x.tagType, caretPosition, target);
          target.selectionStart = caretPosition;
          target.selectionEnd = caretPosition;
        }
      });
    }
  }

  dispatchUpdate(payload: string) {
    this.state.dispatch(new UpdateText(payload));
  }

  updateTextAreaOnShortcut(originalText: string, tag: TagTypeEnum, caretPosition: number, el: HTMLTextAreaElement): void {
    // ToDo Text.
    const toDoText = this.textAreaService.getLineText(caretPosition, originalText);

    // Validation
    if (!this.validationService.validateShortcut(toDoText, tag)) {
      return;
    }

    // Side Effects
    switch (tag) {
      case TagTypeEnum.Started: {
        const isStarted = toDoText.match(regexes.tagStarted);
        if ( isStarted !== null) {
          const startDate = isStarted.find( x => x.includes('started')).match(regexes.isoTime)[0];
          console.log (startDate);
        }
      }

    }

    this.textAreaService.toogleTag(originalText, toDoText, tag, caretPosition, el, new Date(Date.now()).toLocaleIsoString());
    this.dispatchUpdate(el.value);
  }
}
