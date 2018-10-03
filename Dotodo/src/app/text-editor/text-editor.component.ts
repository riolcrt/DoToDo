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
import { DateService } from '../date.service';

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
    private dateService: DateService,
    private el: ElementRef
    ) {}

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
          this.updateTextAreaOnShortcut(x.tagType, target);
          target.selectionStart = caretPosition;
          target.selectionEnd = caretPosition;
        }
      });
    }
  }

  dispatchUpdate(payload: string) {
    this.state.dispatch(new UpdateText(payload));
  }

  updateTextAreaOnShortcut(tag: TagTypeEnum, el: HTMLTextAreaElement): void {
    const caretPosition = el.selectionStart;
    const originalText = el.value;
    let tagDate = new Date(Date.now());
    const toDoText = this.textAreaService.getLineText(caretPosition, originalText);

    // Validation
    if (!this.validationService.validateShortcut(toDoText, tag)) {
      return;
    }
    const isTagStarted = toDoText.match(regexes.tagStarted);
    const isTagLasted = toDoText.match(regexes.tagElapsed);

    // Side Effects
    switch (tag) {
      case TagTypeEnum.Started:
        if ( isTagStarted ) {
          const startDate = this.textAreaService.extractDateFromTag(isTagStarted, 'started');
          const timeElapsed = tagDate.getTime() - startDate.getTime();
          const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
          this.textAreaService.toogleTag(toDoText, TagTypeEnum.Lasted, caretPosition, el, timeElapsedString);
        }
        if ( isTagLasted ) {
          const lastedTimeInMilliseconds = this.dateService.stringTimeEllapsedToMilliseconds(isTagLasted[0].match(regexes.tagDetails)[1]);
          tagDate = new Date(Date.now() - lastedTimeInMilliseconds);
          this.textAreaService.toogleTag(toDoText, TagTypeEnum.Lasted, caretPosition, el, isTagLasted);
        }
        break;
      case TagTypeEnum.Done:
        if ( isTagStarted ) {
          const startDate = this.textAreaService.extractDateFromTag(isTagStarted, 'started');
          const timeElapsed = tagDate.getTime() - startDate.getTime();
          const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
          this.textAreaService.toogleTag(toDoText, TagTypeEnum.Lasted, caretPosition, el, timeElapsedString);
        }
        break;
      case TagTypeEnum.Cancelled:
        if ( isTagStarted ) {
          const startDate = this.textAreaService.extractDateFromTag(isTagStarted, 'started');
          const timeElapsed = tagDate.getTime() - startDate.getTime();
          const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
          this.textAreaService.toogleTag(toDoText, TagTypeEnum.Wasted, caretPosition, el, timeElapsedString);
        }
        break;
    }

    this.textAreaService.toogleTag(toDoText, tag, caretPosition, el, this.dateService.toLocaleIsoString(tagDate));
    this.dispatchUpdate(el.value);
  }
}
