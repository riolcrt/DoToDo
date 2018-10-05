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

  private textAreaElement: HTMLTextAreaElement;
  private caretPosition: number;

  constructor (
    private state: Store,
    private validationService: ShortcutValidationService,
    private textAreaService: TextAreaParseService,
    private dateService: DateService,
    private el: ElementRef
    ) {}

  ngOnInit() {
    this.textAreaElement = this.el.nativeElement.querySelector('textarea');
    this.dispatchUpdate(this.textAreaElement.value);
  }

  onTextInput (event: TextEvent) {
    this.dispatchUpdate(this.textAreaElement.value);
  }

  onShortcut(event: KeyboardEvent ) {
    this.caretPosition = this.textAreaElement.selectionStart;

    if (event.altKey) {
      this.onAltKey(event.key);
    } else if (event.key === 'Tab') {
      this.onTabKey(event.shiftKey);
    }
  }

  onAltKey(pressedAlso) {
    if (TODOITEM_SHORTCUTS.some( x => x.key === pressedAlso ))  {
      event.preventDefault();
    }
    TODOITEM_SHORTCUTS.forEach(x => {
      if (pressedAlso === x.key) {
        this.updateTextAreaOnShortcut(x.tagType);
      }
    });
  }

  onTabKey(isShiftKey) {
    event.preventDefault();
    if (isShiftKey) {
      this.textAreaService.removeTabulation(this.caretPosition, this.textAreaElement);
    } else {
      this.textAreaService.addTabulation(this.caretPosition, this.textAreaElement);
    }
    this.dispatchUpdate(this.textAreaElement.value);
  }

  dispatchUpdate(payload: string) {
    this.state.dispatch(new UpdateText(payload));
    this.textAreaElement.selectionStart = this.caretPosition;
    this.textAreaElement.selectionEnd = this.caretPosition;
  }

  addLastedTagFromNotFinishedStartedTag(tagDate, tagStartedMatch) {
    const startDate = this.textAreaService.extractDateFromTag(tagStartedMatch, 'started');
    const timeElapsed = tagDate.getTime() - startDate.getTime();
    const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
    this.textAreaService.toogleTag(TagTypeEnum.Lasted, timeElapsedString, this.caretPosition, this.textAreaElement);
  }

  removeLastedTag(tagLastedMatch) {
    this.textAreaService.toogleTag(TagTypeEnum.Lasted, tagLastedMatch, this.caretPosition, this.textAreaElement);
  }

  updateTimeOffset(tagLastedMatch) {
    const lastedTimeInMilliseconds = this.dateService.stringTimeEllapsedToMilliseconds(tagLastedMatch[0].match(regexes.tagDetails)[1]);
    return - lastedTimeInMilliseconds;
  }

  updateTextAreaOnShortcut(tagType: TagTypeEnum): void {
    let timeOffset = 0;
    const toDoText = this.textAreaService.getLineText(this.caretPosition, this.textAreaElement.value);

    // Validation
    if (!this.validationService.validateShortcut(toDoText, tagType)) {
      return;
    }
    const startedTag = toDoText.match(regexes.tagStarted);
    const lastedTag = toDoText.match(regexes.tagElapsed);

    // Side Effects
    switch (tagType) {
      case TagTypeEnum.Started:
        if ( startedTag ) {
          this.addLastedTagFromNotFinishedStartedTag(new Date(Date.now()), startedTag);
        }
        if ( lastedTag ) {
          timeOffset = this.updateTimeOffset (lastedTag);
          this.removeLastedTag( lastedTag );
        }
        break;
      case TagTypeEnum.Done:
        if ( startedTag ) {
          const startDate = this.textAreaService.extractDateFromTag(startedTag, 'started');
          const timeElapsed = new Date(Date.now()).getTime() - startDate.getTime();
          const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
          this.textAreaService.toogleTag(TagTypeEnum.Lasted, timeElapsedString, this.caretPosition, this.textAreaElement);
        }
        break;
      case TagTypeEnum.Cancelled:
        if ( startedTag ) {
          const startDate = this.textAreaService.extractDateFromTag(startedTag, 'started');
          const timeElapsed = new Date(Date.now()).getTime() - startDate.getTime();
          const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
          this.textAreaService.toogleTag(TagTypeEnum.Wasted, timeElapsedString, this.caretPosition, this.textAreaElement);
        }
        break;
    }
    const timeString = this.dateService.toLocaleIsoString(new Date(Date.now() + timeOffset));
    this.textAreaService.toogleTag(tagType, timeString, this.caretPosition, this.textAreaElement);
    this.dispatchUpdate(this.textAreaElement.value);
  }
}
