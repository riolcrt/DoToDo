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

  toggleStartedTag(tagDate, toDoText, caretPosition, el, tagStartedMatch) {
    const startDate = this.textAreaService.extractDateFromTag(tagStartedMatch, 'started');
    const timeElapsed = tagDate.getTime() - startDate.getTime();
    const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
    this.textAreaService.toogleTag(toDoText, TagTypeEnum.Lasted, caretPosition, el, timeElapsedString);
  }

  removeLastedTag(toDoText, caretPosition, el, tagLastedMatch) {
    this.textAreaService.toogleTag(toDoText, TagTypeEnum.Lasted, caretPosition, el, tagLastedMatch);
  }

  updateTimeOffset(currentTime, tagLastedMatch) {
    const lastedTimeInMilliseconds = this.dateService.stringTimeEllapsedToMilliseconds(tagLastedMatch[0].match(regexes.tagDetails)[1]);
    return - lastedTimeInMilliseconds;
  }

  updateTextAreaOnShortcut(tag: TagTypeEnum, el: HTMLTextAreaElement): void {
    const caretPosition = el.selectionStart;
    const originalText = el.value;
    let timeOffset = 0;
    const toDoText = this.textAreaService.getLineText(caretPosition, originalText);

    // Validation
    if (!this.validationService.validateShortcut(toDoText, tag)) {
      return;
    }
    const startedTag = toDoText.match(regexes.tagStarted);
    const lastedTag = toDoText.match(regexes.tagElapsed);

    // Side Effects
    switch (tag) {
      case TagTypeEnum.Started:
        if ( startedTag ) {
          this.toggleStartedTag(new Date(Date.now()), toDoText, caretPosition, el, startedTag);
        }
        if ( lastedTag ) {
          timeOffset = this.updateTimeOffset (timeOffset, lastedTag);
          this.removeLastedTag(toDoText, caretPosition, el, lastedTag );
        }
        break;
      case TagTypeEnum.Done:
        if ( startedTag ) {
          const startDate = this.textAreaService.extractDateFromTag(startedTag, 'started');
          const timeElapsed = new Date(Date.now()).getTime() - startDate.getTime();
          const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
          this.textAreaService.toogleTag(toDoText, TagTypeEnum.Lasted, caretPosition, el, timeElapsedString);
        }
        break;
      case TagTypeEnum.Cancelled:
        if ( startedTag ) {
          const startDate = this.textAreaService.extractDateFromTag(startedTag, 'started');
          const timeElapsed = new Date(Date.now()).getTime() - startDate.getTime();
          const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
          this.textAreaService.toogleTag(toDoText, TagTypeEnum.Wasted, caretPosition, el, timeElapsedString);
        }
        break;
    }

    this.textAreaService.toogleTag(toDoText, tag, caretPosition, el, this.dateService.toLocaleIsoString(new Date(Date.now() + timeOffset)));
    this.dispatchUpdate(el.value);
  }
}
