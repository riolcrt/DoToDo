import { Component, ElementRef, OnInit } from '@angular/core';
import { Store } from '@ngxs/store';
import { UpdateText } from '../shared/TodosActions';
import { Observable } from 'rxjs';
import { TodoItem, TodoItemTypeEnum, TagTypeEnum } from '../shared/TodosModel';
import { TodosState } from '../shared/TodosState';
import { TODOITEM_SHORTCUTS } from '../constants/shortcuts';
import { regexes } from '../regex';

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

  onShortcut(event: KeyboardEvent ) {
    const target: HTMLTextAreaElement = event.target as HTMLTextAreaElement;
    const caretPosition: number = target.selectionStart;


    if (event.altKey || event.code === 'Tab') {
      event.preventDefault();
    }

    TODOITEM_SHORTCUTS.forEach(x => {
      if (event.key === x.key) {
        this.toogleTag(target.value, `@${TagTypeEnum[x.action].toLowerCase()}`, caretPosition, target, undefined);
        target.selectionStart = caretPosition;
        target.selectionEnd = caretPosition;
        this.dispatchUpdate(target.value);
      }
    });
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
    details: string = new Date(Date.now()).toLocaleString(),
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

  toogleTag(originalText: string, tag: string, caretPosition: number, el: HTMLTextAreaElement, details) {
    const lineText = this.getLineText(caretPosition, originalText);
    if (this.findTagInLine(lineText, tag) !== undefined) {
      el.value = this.deleteTagFromLine(originalText, tag, caretPosition);
    } else {
      el.value = this.addTagToLine(originalText, tag, details, caretPosition);
    }
  }
}
