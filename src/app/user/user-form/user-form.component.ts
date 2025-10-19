import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { Role } from '../../auth/models/auth.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  userForm: FormGroup;
  loading = false;
  mensagemErro: string | null = null;
  mensagemSucesso: string | null = null;
  roles = Object.values(Role);
  Role=Role;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: [Role.USER, Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  salvar(): void {
    if (this.userForm.invalid) {
      this.mensagemErro = 'Por favor, preencha todos os campos corretamente.';
      return;
    }

    const { confirmPassword, ...request } = this.userForm.value;
    
    this.loading = true;
    this.mensagemErro = null;

    this.authService.createUser(request).subscribe({
      next: () => {
        this.mensagemSucesso = '✅ Usuário criado com sucesso!';
        this.loading = false;
        
        setTimeout(() => {
          this.router.navigate(['/produtos']);
        }, 2000);
      },
      error: (err) => {
        this.loading = false;
        this.mensagemErro = err.error?.message || 'Erro ao criar usuário. Tente novamente.';
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/produtos']);
  }

  get username() { return this.userForm.get('username'); }
  get email() { return this.userForm.get('email'); }
  get password() { return this.userForm.get('password'); }
  get confirmPassword() { return this.userForm.get('confirmPassword'); }
}