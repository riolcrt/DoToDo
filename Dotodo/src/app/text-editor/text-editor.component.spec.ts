import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TextEditorComponent } from './text-editor.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgxsModule } from '@ngxs/store';
import { TodosState } from '../shared/TodosState';

describe('TextEditorComponent', () => {
  let component: TextEditorComponent;
  let fixture: ComponentFixture<TextEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxsModule.forRoot([TodosState])],
      declarations: [ TextEditorComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('should get the current line end position', () => {
    const textTest = `1234567890
1234567890
1234567890`;
    expect(component.getLineEndPosition(1, textTest)).toBe(10);
    expect(component.getLineEndPosition(11, textTest)).toBe(21);
    expect(component.getLineEndPosition(22, textTest)).toBe(32);
  });

  it ('should get the current line start position', () => {
    const textTest = `1234567890
1234567890
1234567890`;
  expect(component.getLineStartPosition(1, textTest)).toBe(0);
  expect(component.getLineStartPosition(11, textTest)).toBe(11);
  expect(component.getLineStartPosition(22, textTest)).toBe(22);
  });

  it ('should return the tag in current line', () => {
    const case1 = 'No tengo fecha @done';
    expect(component.findTagInLine(case1, '@done')).toBe(' @done');
  });

  it ('should return the tag without date if date parenthesis are open', () => {
    expect(component.findTagInLine('Tengo fecha @done(Mi fecha', '@done')).toBe(' @done');
  });

  it ('should return the tag in current line with date', () => {
    expect(component.findTagInLine('Tengo fecha @done(Mi-fecha)', '@done')).toBe(' @done(Mi-fecha)');
  });

  it ('should return undefined if tag is not found', () => {
    const text = 'Tengo fecha @done(Mi fecha)';
    expect(component.findTagInLine(text, '@done')).toBe(' @done(Mi fecha)');
  });

  it ('should add the tag text with current date to original text', () => {
    const details = 'ellapsed 1h';

    const case1 = 'Soy una linea';
    const case1Result = component.addTagToLine(case1, '@done', details, 0);
    expect(case1Result).toBe('Soy una linea @done(ellapsed 1h)');

    const case2 = 'Soy una linea\nyo soy otra';
    const case2Result = component.addTagToLine(case2, '@done', details, 0);
    expect(case2Result).toBe('Soy una linea @done(ellapsed 1h)\nyo soy otra');
  });

  it ('should delete a tag if it already exist', () => {
    const case1 = 'Soy una linea con tag @done(ellapsed)';
    expect(component.deleteTagFromLine(case1, '@done', 26)).toBe('Soy una linea con tag');

    const case2 = 'Soy una linea sin tag\notra sin tag\nyo si tengo tag @done(ellapsed)';
    expect(component.deleteTagFromLine(case2, '@done', 38)).toBe('Soy una linea sin tag\notra sin tag\nyo si tengo tag');

  });

  it ('should return the original text if you try to delete a non existing tag in line', () => {
    const originalText = 'This is the original text with no tag';
    expect(component.deleteTagFromLine(originalText, '@done', 0)).toBe(originalText);
  });

  it ('should check if current line is a task', () => {
    expect(component.isToDo('- Yeah im a todo')).toBe(true);
    expect(component.isToDo('Im not a todo')).toBe(false);
    expect(component.isToDo('-Im not a todo')).toBe(false);
  });
});
