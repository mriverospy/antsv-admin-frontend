import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivoListComponent } from './archivo-list.component';

describe('ArchivoListComponent', () => {
  let component: ArchivoListComponent;
  let fixture: ComponentFixture<ArchivoListComponent>;

  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArchivoListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ArchivoListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
