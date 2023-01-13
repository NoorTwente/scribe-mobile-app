import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-info',
  templateUrl: './info.page.html',
  styleUrls: ['./info.page.scss'],
})
export class InfoPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
  }


  //Button Handlers

  navigateToHomePage(){
    this.router.navigate(['home']);
  }

  navigateToRecordingPage(){
    this.router.navigate(['recording']);
  }

  navigateToFilesPage(){
    this.router.navigate(['files']);
  }

  logout(){
    this.router.navigate(['login'])
  }

}
