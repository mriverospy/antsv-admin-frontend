import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivoFormComponent } from './archivo-form.component';

describe('ArchivoFormComponent', () => {
  let component: ArchivoFormComponent;
  let fixture: ComponentFixture<ArchivoFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivoFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArchivoFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
