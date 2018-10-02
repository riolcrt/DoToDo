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
});
