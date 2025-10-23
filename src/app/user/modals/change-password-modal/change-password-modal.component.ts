import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-password-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password-modal.component.html',
  styleUrls: ['./change-password-modal.component.css']
})
export class ChangePasswordModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() passwordChanged = new EventEmitter<void>();

  passwordForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.passwordForm = this.fb.group({
      senhaAtual: ['', Validators.required],
      senhaNova: ['', [Validators.required, Validators.minLength(6)]],
      senhaNovaConfirmacao: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.errorMessage = 'Preencha todos os campos corretamente';
      return;
    }

    const { senhaNova, senhaNovaConfirmacao } = this.passwordForm.value;

    if (senhaNova !== senhaNovaConfirmacao) {
      this.errorMessage = 'As senhas não conferem';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.userService.changePassword(this.passwordForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Senha alterada com sucesso!';
        setTimeout(() => {
          this.passwordChanged.emit();
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erro ao alterar senha';
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}