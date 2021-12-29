import { Component, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from './services/auth.service';
import { NewUser } from './models/newUser.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  @ViewChild('form') form: NgForm;

  submissionType: 'login' | 'join' = 'login'

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit() {
  }
  //* Logic for form validation and passing form data
  onSubmit() {
    const { email, password } = this.form.value;
    if (!email || !password) return;

    if (this.submissionType === 'login') {
      return this.authService.login(email, password).subscribe(() => {
        this.router.navigateByUrl('/home')
      })
    } else if (this.submissionType === 'join') {
      const { firstName, lastName } = this.form.value;
      if(!firstName || !lastName) return;

      const newUser: NewUser = { firstName, lastName, email, password };

      return this.authService.register(newUser).subscribe(() => {
        this.toggleText();
      });
    }
  }
  //* To swap the text based on wether the user is registering or logging in
  toggleText() {
    if (this.submissionType === 'login') {
      this.submissionType = 'join'
    } else if (this.submissionType === 'join') {
      this.submissionType = 'login'
    }
  }


}
