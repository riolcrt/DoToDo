import { Component } from '@angular/core';
import { Store } from '@ngxs/store';

@Component({
  selector: 'app-text-editor',
  templateUrl: './text-editor.component.html',
  styleUrls: ['./text-editor.component.css']
})
export class TextEditorComponent {
  constructor (private state: Store) {}

  onTextInput (e: TextEvent) {
    const target: HTMLTextAreaElement = e.target as HTMLTextAreaElement;
    // this.state.dispatch(new UpdateText(target.value));
  }
}
