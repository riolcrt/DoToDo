import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { StatusBarComponent } from './status-bar/status-bar.component';
import { TextEditorComponent } from './text-editor/text-editor.component';
import { TodosState } from './shared/TodosState';

import { NgxsModule} from '@ngxs/store';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsLoggerPluginModule } from '@ngxs/logger-plugin';
import { NgxsRouterPluginModule } from '@ngxs/router-plugin';
import { TodoItemComponent } from './todo-item/todo-item.component';

@NgModule({
  declarations: [
    AppComponent,
    StatusBarComponent,
    TextEditorComponent,
    TodoItemComponent
  ],
  imports: [
    BrowserModule,
    NgxsReduxDevtoolsPluginModule.forRoot(),
    NgxsLoggerPluginModule.forRoot(),
    NgxsModule.forRoot([TodosState])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
