import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  email: string = "";

  constructor(private router: Router) { }

  ngOnInit() {
  }

  //Login Button Handler
  pressedLogin(){
    console.log(this.email);
    this.router.navigate(['home']);
  }
}
