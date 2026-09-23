import { Archivo } from '../models/archivo.model';

describe('Archivo', () => {
  it('should create an instance', () => {
    expect(new Archivo(1, "documento.txt,SG9sYQ==")).toBeTruthy();
  });
});