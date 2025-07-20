import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VibematchComponent } from './vibematch.component';

describe('VibematchComponent', () => {
  let component: VibematchComponent;
  let fixture: ComponentFixture<VibematchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VibematchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VibematchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
