import { Injectable } from '@angular/core';
import { ShortcutValidationErrorEnum, TagTypeEnum } from './shared/TodosModel';
import { regexes } from './regex';

@Injectable({
  providedIn: 'root'
})
export class ShortcutValidationService {

  constructor() { }

  validateShortcut(lineText: string, tag: TagTypeEnum): boolean {
    let validationErrors: ShortcutValidationErrorEnum[] = [];

    validationErrors = [ ... this.validateTodo(lineText, validationErrors)];

    switch (tag) {
      case TagTypeEnum.Done:
      validationErrors = [ ... this.validateDone(lineText, validationErrors)];
      break;
      case TagTypeEnum.Cancelled:
      validationErrors = [ ... this.validateCancelled(lineText, validationErrors)];
      break;
      case TagTypeEnum.Started:
      validationErrors = [ ... this.validateStarted(lineText, validationErrors)];
    }

    if (validationErrors.length > 0 ) {
      validationErrors.forEach(x => console.log (ShortcutValidationErrorEnum[x]));
      return false;
    }
    return true;
  }

  private validateTodo(lineText: string, validationErrors: ShortcutValidationErrorEnum[] ): ShortcutValidationErrorEnum[] {
    if (lineText.match(regexes.todo) === null) {
      validationErrors = [ ... [ShortcutValidationErrorEnum.only_task_can_have_tags]];
    }
    return validationErrors;
  }

  private validateDone(task: string, validationErrors: ShortcutValidationErrorEnum[]): ShortcutValidationErrorEnum[] {
    if (task.match(regexes.tagCancel) !== null) {
      validationErrors = [ ... [ShortcutValidationErrorEnum.cancelled_can_not_be_done]];
    }
    return validationErrors;
  }

  private validateCancelled(task: string, validationErrors: ShortcutValidationErrorEnum[]): ShortcutValidationErrorEnum[] {
    if (task.match(regexes.tagDone) !== null) {
      validationErrors = [ ... [ShortcutValidationErrorEnum.done_can_not_be_cancelled]];
    }
    return validationErrors;
  }

  private validateStarted(task: string, validationErrors: ShortcutValidationErrorEnum[]): ShortcutValidationErrorEnum[] {
    if (task.match(regexes.tagFinished) !== null) {
      validationErrors = [ ... [ShortcutValidationErrorEnum.finished_can_not_be_started]];
    }
    return validationErrors;
  }
}
