import { TestBed, inject } from '@angular/core/testing';

import { ShortcutValidationService } from './shortcut-validation.service';

describe('ShortcutValidationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ShortcutValidationService]
    });
  });

  it('should be created', inject([ShortcutValidationService], (service: ShortcutValidationService) => {
    expect(service).toBeTruthy();
  }));
});
