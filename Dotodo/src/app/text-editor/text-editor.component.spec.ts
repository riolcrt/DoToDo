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

  it ('should detect if tag already exist in current line and return position', () => {
    const case1 = 'There is no tags in this line';
    const case2 = '@done';
    const case3 = '12345@done(2345)';
    const case4 = '@done @started(mayo del 90)';
    const case5 = '@done with more text';

    expect(component.selectTagInLine(case1, '@done')).toBe(null);
    expect(component.selectTagInLine(case2, '@done').startPosition).toBe(0);
    expect(component.selectTagInLine(case2, '@done').endPosition).toBe(5);
    expect(component.selectTagInLine(case3, '@done').startPosition).toBe(5);
    expect(component.selectTagInLine(case3, '@done').endPosition).toBe(15, 'because it has date');
    expect(component.selectTagInLine(case4, '@done').endPosition).toBe(5, 'because it have no date');
    expect(component.selectTagInLine(case5, '@done').endPosition).toBe(5);
  });
});
