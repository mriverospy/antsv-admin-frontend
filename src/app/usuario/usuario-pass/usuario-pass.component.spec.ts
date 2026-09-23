import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioPassComponent } from './usuario-pass.component';

describe('UsuarioPassComponent', () => {
  let component: UsuarioPassComponent;
  let fixture: ComponentFixture<UsuarioPassComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsuarioPassComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuarioPassComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
