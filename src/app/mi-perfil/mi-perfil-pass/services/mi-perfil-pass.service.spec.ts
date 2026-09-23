import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MiPerfilPassService } from './mi-perfil-pass.service';

describe('MiPerfilPassService', () => {
  let service: MiPerfilPassService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MiPerfilPassService]
    });
    service = TestBed.inject(MiPerfilPassService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
