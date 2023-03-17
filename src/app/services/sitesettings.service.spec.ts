import { TestBed, inject } from '@angular/core/testing';

import { SitesettingsService } from './sitesettings.service';

describe('SitesettingsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SitesettingsService]
    });
  });

  it('should be created', inject([SitesettingsService], (service: SitesettingsService) => {
    expect(service).toBeTruthy();
  }));
});
