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
    const lineStartPosition = this.textAreaService.getLineStartPosition(this.caretPosition, this.textAreaElement.value);
    if (TODOITEM_SHORTCUTS.some( x => x.key === pressedAlso ))  {
      event.preventDefault();
    }
    TODOITEM_SHORTCUTS.forEach(x => {
      if (pressedAlso === x.key) {
        this.updateTextAreaOnShortcut(x.tagType, this.textAreaService.getLineText(this.caretPosition, this.textAreaElement.value));
      }
    });
    this.textAreaElement.selectionStart = lineStartPosition;
    this.textAreaElement.selectionEnd = lineStartPosition;

  }

  onTabKey(isShiftKey) {
    event.preventDefault();
    if (isShiftKey) {
      this.textAreaService.removeTabulation(this.caretPosition, this.textAreaElement);
    } else {
      this.textAreaService.addTabulation(this.caretPosition, this.textAreaElement);
    }
    this.dispatchUpdate(this.textAreaElement.value);
    this.textAreaElement.selectionStart = this.caretPosition;
    this.textAreaElement.selectionEnd = this.caretPosition;
  }

  dispatchUpdate(payload: string) {
    this.state.dispatch(new UpdateText(payload));
  }


  updateTextAreaOnShortcut(tagType: TagTypeEnum, toDoText: string): void {
    // Validation
    if (!this.validationService.validateShortcut(toDoText, tagType)) {
      return;
    }
    const startedTag = toDoText.match(regexes.tagStarted);
    const lastedTag = toDoText.match(regexes.tagLasted);
    const wastedTag = toDoText.match(regexes.tagWasted);

    // Side Effects
    switch (tagType) {
      case TagTypeEnum.Started:
        this.toggleStartTag(startedTag, lastedTag, wastedTag);
        break;
      case TagTypeEnum.Done:
        this.toogleDoneTag(startedTag);
        break;
      case TagTypeEnum.Cancelled:
        this.toggleCancelTag(startedTag);
        break;
    }
  }

  toogleDoneTag(startedTag) {
    if ( startedTag ) {
      const startDate = this.textAreaService.extractDateFromTag(startedTag, 'started');
      const timeElapsed = new Date(Date.now()).getTime() - startDate.getTime();
      const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
      this.textAreaService.toogleTag(TagTypeEnum.Lasted, timeElapsedString, this.caretPosition, this.textAreaElement);
    }
    const timeString = this.dateService.toLocaleIsoString(new Date(Date.now()));
    this.toogleTag(TagTypeEnum.Done, timeString);
  }

  toggleStartTag(startedTag: RegExpMatchArray, lastedTag: RegExpMatchArray, wastedTag: RegExpMatchArray) {
    let timeOffset = 0;
    if ( startedTag ) {
      this.addLastedTagFromNotFinishedStartedTag(new Date(Date.now()), startedTag);
      this.removeTag(TagTypeEnum.Started);
    } else if ( lastedTag ) {
      timeOffset = - this.dateService.stringTimeEllapsedToMilliseconds(lastedTag[0].match(regexes.tagDetails)[1]);
      this.addTag(TagTypeEnum.Started, this.dateService.toLocaleIsoString(new Date(Date.now() + timeOffset)));
      this.removeTag(TagTypeEnum.Lasted);
    } else if ( wastedTag ) {
      timeOffset = - this.dateService.stringTimeEllapsedToMilliseconds(wastedTag[0].match(regexes.tagDetails)[1]);
      this.addTag(TagTypeEnum.Started, this.dateService.toLocaleIsoString(new Date(Date.now() + timeOffset)));
      this.removeTag(TagTypeEnum.Wasted);
    } else {
      this.addTag(TagTypeEnum.Started, this.dateService.toLocaleIsoString(new Date(Date.now())));
    }
  }

  toggleCancelTag(startedTag: RegExpMatchArray) {
    if ( startedTag ) {
      const startDate = this.textAreaService.extractDateFromTag(startedTag, 'started');
      const timeElapsed = new Date(Date.now()).getTime() - startDate.getTime();
      const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
      this.removeTag(TagTypeEnum.Started);
      this.addTag(TagTypeEnum.Wasted, timeElapsedString);
    }

    const timeString = this.dateService.toLocaleIsoString(new Date(Date.now()));
    this.toogleTag(TagTypeEnum.Cancelled, timeString );
  }

  addLastedTagFromNotFinishedStartedTag(tagDate, tagStartedMatch) {
    const startDate = this.textAreaService.extractDateFromTag(tagStartedMatch, 'started');
    const timeElapsed = tagDate.getTime() - startDate.getTime();
    const timeElapsedString = this.dateService.timeEllapsedToString(timeElapsed);
    this.textAreaService.toogleTag(TagTypeEnum.Lasted, timeElapsedString, this.caretPosition, this.textAreaElement);
  }

  toogleTag(tagType: TagTypeEnum, timeString: string) {
    this.textAreaService.toogleTag(tagType, timeString, this.caretPosition, this.textAreaElement);
    this.dispatchUpdate(this.textAreaElement.value);
  }

  addTag (tagType, timeString: string) {
    this.textAreaService.addTag(tagType, timeString, this.caretPosition, this.textAreaElement);
    this.dispatchUpdate(this.textAreaElement.value);
  }

  removeTag (tagType) {
    this.textAreaService.removeTag(tagType, this.caretPosition, this.textAreaElement);
    this.dispatchUpdate(this.textAreaElement.value);
  }
}
