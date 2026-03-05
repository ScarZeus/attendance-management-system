import { Component } from '@angular/core';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  isFlipped = false;

  loginData = {
    emp_id: '',
    email: ''
  };

  registerData = {
    emp_id: '',
    name: '',
    email: '',
    department: ''
  };

  constructor(private auth: Auth, private router: Router) {}

  toggleCard() {
    this.isFlipped = !this.isFlipped;
  }

  login() {
    const data = {
      emp_id : this.loginData.emp_id,
      email : this.loginData.email
    }
    this.auth.login(data)
      .subscribe({
        next: (res: any) => {
          this.auth.saveUser(res);
          console.log("Moving to Navigation");
          this.router.navigate(['/dashboard']);
        },
        error: () => alert("Invalid credentials")
      });
  }

  register() {
    this.auth.signup(this.registerData)
      .subscribe({
        next: () => {
          alert("Registration successful");
          this.toggleCard();
        },
        error: () => alert("Registration failed")
      });
  }
}
