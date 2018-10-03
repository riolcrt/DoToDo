import { TestBed, inject } from '@angular/core/testing';

import { DateService } from './date.service';

describe('DateService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateService]
    });
  });

  it('should be created',
  inject([DateService], (service: DateService) => {
    expect(service).toBeTruthy();
  }));

  it('should return a string from milliseconds representing time ellapsed',
  inject([DateService], (service: DateService) => {
    expect(service.timeEllapsedToString(1000)).toBe('1s');
    expect(service.timeEllapsedToString(61000)).toBe('1m and 1s');
    expect(service.timeEllapsedToString(3661000)).toBe('1h and 1m');
    expect(service.timeEllapsedToString(3600000 * 25)).toBe('1d and 1h');
  }));

  it('should parse ellapsed string and return a sum of milliseconds',
  inject([DateService], (service: DateService) => {
    expect(service.stringTimeEllapsedToMilliseconds('1s')).toBe(1000);
    expect(service.stringTimeEllapsedToMilliseconds('1m and 1s')).toBe(1000 * 61);
    expect(service.stringTimeEllapsedToMilliseconds('1h and 1m')).toBe(1000 * 60 * 61);
    expect(service.stringTimeEllapsedToMilliseconds('1d and 1h')).toBe(3600000 * 25);
  }));

});
