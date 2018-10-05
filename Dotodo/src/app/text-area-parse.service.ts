import { Injectable } from '@angular/core';
import { regexes } from './regex';
import { TagTypeEnum } from './shared/TodosModel';

@Injectable({
  providedIn: 'root'
})
export class TextAreaParseService {
  private tabulation = '    ';
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
    tagName: string,
    details: string,
    caretPosition: number): string {
      const lineEndPosition = this.getLineEndPosition(caretPosition, originalText);
      return `${originalText.slice(0, lineEndPosition)} ${tagName}(${details})${originalText.slice(lineEndPosition)}`;
  }

  deleteTagFromLine(originalText: string, tagName: string, caretPosition: number): string {
    const lineText = this.getLineText(caretPosition, originalText);
    const lineStart = this.getLineStartPosition(caretPosition, originalText);
    const tagInLine = this.findTagInLine(lineText, tagName);

    if (tagInLine !== undefined ) {
      const tagStartPosition = lineStart + lineText.indexOf(tagInLine);
      const tagEndPosition = tagStartPosition + tagInLine.length;
      return originalText.substring(0, tagStartPosition) + originalText.substring(tagEndPosition);
    } else {
      return originalText;
    }
  }

  toogleTag(tagType: TagTypeEnum, tagTime: string, caretPosition: number, textAreaHtmlElement: HTMLTextAreaElement) {
    const originalText = textAreaHtmlElement.value;
    const toDoText = this.getLineText(caretPosition, originalText);
    if (this.findTagInLine(toDoText, tagType.toString()) !== undefined) {
      textAreaHtmlElement.value = this.deleteTagFromLine(originalText, tagType.toString(), caretPosition);
    } else {
      textAreaHtmlElement.value = this.addTagToLine(originalText, tagType.toString(), tagTime, caretPosition);
    }
  }

  addTabulation(caretPosition: number, textAreaHtmlElement: HTMLTextAreaElement) {
    const lineStart = this.getLineStartPosition(caretPosition, textAreaHtmlElement.value);
    const prevText = textAreaHtmlElement.value.substring(0, lineStart);
    const nextText = textAreaHtmlElement.value.substring(lineStart);
    textAreaHtmlElement.value = `${prevText}${this.tabulation}${nextText}`;
  }

  removeTabulation(caretPosition: number, textAreaHtmlElement: HTMLTextAreaElement) {
    const lineText = this.getLineText(caretPosition, textAreaHtmlElement.value);
    const lineStart = this.getLineStartPosition(caretPosition, textAreaHtmlElement.value);
    const prevText = textAreaHtmlElement.value.substring(0, lineStart);
    const nextText = textAreaHtmlElement.value.substring(lineStart + this.tabulation.length);
    if (lineText.search(/\S/) >= this.tabulation.length) {
      textAreaHtmlElement.value = `${prevText}${nextText}`;
    }
  }

  extractDateFromTag(tag, tagName): Date {
    return new Date (tag.find( x => x.includes(tagName)).match(regexes.isoTime)[0]);
  }

}
