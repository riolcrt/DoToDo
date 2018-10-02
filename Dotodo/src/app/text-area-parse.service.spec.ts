import { TestBed, inject } from '@angular/core/testing';

import { TextAreaParseService } from './text-area-parse.service';

describe('TextAreaParseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TextAreaParseService]
    });
  });

  it('should be created', inject([TextAreaParseService], (service: TextAreaParseService) => {
    expect(service).toBeTruthy();
  }));

  it ('should get the current line end position', inject([TextAreaParseService], (service: TextAreaParseService) => {
    const textTest = `1234567890
1234567890
1234567890`;
    expect(service.getLineEndPosition(1, textTest)).toBe(10);
    expect(service.getLineEndPosition(11, textTest)).toBe(21);
    expect(service.getLineEndPosition(22, textTest)).toBe(32);
  }));

  it ('should get the current line start position', inject([TextAreaParseService], (service: TextAreaParseService) => {
    const textTest = `1234567890
1234567890
1234567890`;
  expect(service.getLineStartPosition(1, textTest)).toBe(0);
  expect(service.getLineStartPosition(11, textTest)).toBe(11);
  expect(service.getLineStartPosition(22, textTest)).toBe(22);
  }));

  it ('should return the tag in current line',
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    const case1 = 'No tengo fecha @done';
    expect(service.findTagInLine(case1, '@done')).toBe(' @done');
  }));

  it ('should return the tag without date if date parenthesis are open',
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    expect(service.findTagInLine('Tengo fecha @done(Mi fecha', '@done')).toBe(' @done');
  }));

  it ('should return the tag in current line with date',
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    expect(service.findTagInLine('Tengo fecha @done(Mi-fecha)', '@done')).toBe(' @done(Mi-fecha)');
  }));

  it ('should return undefined if tag is not found',
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    const text = 'Tengo fecha @done(Mi fecha)';
    expect(service.findTagInLine(text, '@done')).toBe(' @done(Mi fecha)');
  }));

  it ('should add the tag text with current date to original text',
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    const details = 'ellapsed 1h';

    const lineText = 'Soy una linea';
    expect(service.addTagToLine(lineText, '@done', details, 0)).toBe('Soy una linea @done(ellapsed 1h)');

  }));

  it ('should add the tag text with details to text in current line', 
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    const details = 'ellapsed 1h';

    const lineText = 'Soy una linea\nyo soy otra';
    expect(service.addTagToLine(lineText, '@done', details, 0)).toBe('Soy una linea @done(ellapsed 1h)\nyo soy otra');
  }));

  it ('should delete a tag if it already exist',
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    const lineText = 'Soy una linea con tag @done(ellapsed)';
    expect(service.deleteTagFromLine(lineText, '@done', 26)).toBe('Soy una linea con tag');

    const case2 = 'Soy una linea sin tag\notra sin tag\nyo si tengo tag @done(ellapsed)';
    expect(service.deleteTagFromLine(case2, '@done', 38)).toBe('Soy una linea sin tag\notra sin tag\nyo si tengo tag');

  }));

  it ('should return the original text if you try to delete a non existing tag in line', 
  inject([TextAreaParseService], (service: TextAreaParseService) => {
    const originalText = 'This is the original text with no tag';
    expect(service.deleteTagFromLine(originalText, '@done', 0)).toBe(originalText);
  }));
});
