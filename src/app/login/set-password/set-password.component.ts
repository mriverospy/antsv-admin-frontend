import { Component } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ActivatedRoute, Router} from "@angular/router";
import {AuthService} from "../services/auth.service";

@Component({
  selector: 'app-set-password',
  templateUrl: './set-password.component.html',
  styleUrl: './set-password.component.scss'
})
export class SetPasswordComponent {

  passwordForm!: FormGroup;
  token: string | null = null;
  loading: boolean = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;

  constructor(
      private fb: FormBuilder,
      private route: ActivatedRoute,
      private router: Router,
      private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 1. Extraer el token de la URL
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      this.errorMessage = 'Código de verificación no encontrado. Por favor, revisa el enlace completo.';
      return;
    }

    // 2. Inicializar el formulario con validaciones
    this.passwordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // 3. Validador personalizado para asegurar que las contraseñas coincidan
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword')?.value;
    const confirm = form.get('confirmPassword')?.value;

    return password === confirm ? null : { mismatch: true };
  }

  // 4. Método de envío
  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Verifica que las contraseñas coincidan y cumplan el mínimo de 8 caracteres.';
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { newPassword } = this.passwordForm.value;

    // Llama al servicio del backend (El endpoint: POST /api/auth/set-password)
    this.authService.setPassword(this.token!, newPassword).subscribe({
      next: (res) => {
        this.successMessage = '¡Contraseña establecida con éxito! Serás redirigido en 3 segundos.';
        this.loading = false;

        // Redirigir al login
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        // Manejo de errores específicos del backend (token inválido/expirado, etc.)
        this.errorMessage = err.error?.message || 'Error al establecer la contraseña. El código pudo haber expirado.';
      }
    });
  }

  // Métodos de conveniencia para acceder a los controles del formulario en el HTML
  get newPassword() {
    return this.passwordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.passwordForm.get('confirmPassword');
  }

}
