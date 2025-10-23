import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-change-email-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-email-modal.component.html',
  styleUrls: ['./change-email-modal.component.css']
})
export class ChangeEmailModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() emailChanged = new EventEmitter<void>();

  emailForm: FormGroup;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.emailForm = this.fb.group({
      emailNovo: ['', [Validators.required, Validators.email]],
      emailNovoConfirmacao: ['', [Validators.required, Validators.email]],
      senha: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.emailForm.invalid) {
      this.errorMessage = 'Preencha todos os campos corretamente';
      return;
    }

    const { emailNovo, emailNovoConfirmacao } = this.emailForm.value;

    if (emailNovo !== emailNovoConfirmacao) {
      this.errorMessage = 'Os emails não conferem';
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    this.userService.changeEmail(this.emailForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Email alterado com sucesso!';
        setTimeout(() => {
          this.emailChanged.emit();
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Erro ao alterar email';
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}