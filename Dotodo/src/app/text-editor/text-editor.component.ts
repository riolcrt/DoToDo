import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateText } from '../shared/TodosActions';
import { Observable } from 'rxjs';
import { TodoItem, TodoItemTypeEnum, TagTypeEnum, ShortcutValidationErrorEnum } from '../shared/TodosModel';
import { TodosState } from '../shared/TodosState';
import { TODOITEM_SHORTCUTS } from '../constants/shortcuts';
import { regexes } from '../regex';
import { ShortcutValidationService } from '../shortcut-validation.service';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent implements OnInit {
  public todoType: typeof TodoItemTypeEnum = TodoItemTypeEnum;
  public todos$: Observable<TodoItem[]> = this.state.select(TodosState.GetTodoItems);
  constructor (private state: Store, private validationService: ShortcutValidationService, private el: ElementRef) {
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

  getLineNumber(caretPosition: number, originalText): number {
    return originalText.substr(0, caretPosition).split('\n').length;
  }

  getLineText (caretPosition: number, originalText): string {
    return originalText.split('\n')[this.getLineNumber(caretPosition, originalText) - 1];
  }

  getLineEndPosition(caretPosition: number, originalText: string): number {
    const nextLinebreakPosition = originalText.substr(caretPosition, originalText.length).indexOf('\n');
    return  nextLinebreakPosition !== -1 ? caretPosition + nextLinebreakPosition : originalText.length;
  }
  getLineStartPosition(caretPosition: number, originalText: string): number {
    const linesTransform = originalText.replace('\n', ' \n');
    const originalLines = linesTransform.split('\n');
    const currentLine = this.getLineNumber(caretPosition, originalText);

    return  originalLines.slice(0, currentLine - 1).join('0').length;
  }

  findTagInLine(lineText: string, tag: string): string {
    try {
      return lineText.match(regexes.tag).find(x => x.includes(tag));
    } catch {
      return undefined;
    }
  }

  addTagToLine(
    originalText: string,
    tag: string,
    details: string,
    caretPosition: number): string {
      const lineEndPosition = this.getLineEndPosition(caretPosition, originalText);
      return `${originalText.slice(0, lineEndPosition)} ${tag}(${details})${originalText.slice(lineEndPosition)}`;
  }

  deleteTagFromLine(originalText: string, tag: string, caretPosition: number): string {
    const lineText = this.getLineText(caretPosition, originalText);
    const lineStart = this.getLineStartPosition(caretPosition, originalText);
    const tagInLine = this.findTagInLine(lineText, tag);

    if (tagInLine !== undefined ) {
      const tagStartPosition = lineStart + lineText.indexOf(tagInLine);
      const tagEndPosition = tagStartPosition + tagInLine.length;
      return originalText.substring(0, tagStartPosition) + originalText.substring(tagEndPosition);
    } else {
      return originalText;
    }
  }

  toogleTag(originalText: string, toDoText: string, tag: TagTypeEnum, caretPosition: number, el: HTMLTextAreaElement, details) {
    // Toggle
    if (this.findTagInLine(toDoText, tag.toString()) !== undefined) {
      el.value = this.deleteTagFromLine(originalText, tag.toString(), caretPosition);
    } else {
      el.value = this.addTagToLine(originalText, tag.toString(), details, caretPosition);
    }
  }

  updateTextAreaOnShortcut(originalText: string, tag: TagTypeEnum, caretPosition: number, el: HTMLTextAreaElement): void {
    // ToDo Text.
    const toDoText = this.getLineText(caretPosition, originalText);

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

    this.toogleTag(originalText, toDoText, tag, caretPosition, el, new Date(Date.now()).toLocaleIsoString());
    this.dispatchUpdate(el.value);
  }

  
}
