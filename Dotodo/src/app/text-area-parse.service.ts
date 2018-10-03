import { Injectable } from '@angular/core';
import { regexes } from './regex';
import { TagTypeEnum } from './shared/TodosModel';

@Injectable({
  providedIn: 'root'
})
export class TextAreaParseService {

  constructor() { }

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

  toogleTag(toDoText: string, tag: TagTypeEnum, caretPosition: number, el: HTMLTextAreaElement, details) {
    const originalText = el.value;
    if (this.findTagInLine(toDoText, tag.toString()) !== undefined) {
      el.value = this.deleteTagFromLine(originalText, tag.toString(), caretPosition);
    } else {
      el.value = this.addTagToLine(originalText, tag.toString(), details, caretPosition);
    }
  }

  extractDateFromTag(tag, tagName): Date {
    return new Date (tag.find( x => x.includes(tagName)).match(regexes.isoTime)[0]);
  }

}
