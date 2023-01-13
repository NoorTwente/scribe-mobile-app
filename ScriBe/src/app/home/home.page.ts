import { ChangeDetectorRef, Component, ɵsetUnknownPropertyStrictMode } from '@angular/core';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { File } from './file';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { interval } from 'rxjs';
import { Entry, TimeSpan } from './timer';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})


export class HomePage {

  constructor(private router:Router){}

  ngOnInit(){

  }

  //Button Handlers 
   
  navigateToRecordingPage(){
    this.router.navigate(['recording']);
  }

  navigateToInfoPage(){
    this.router.navigate(['info']);
  }

  navigateToFilesPage(){
    this.router.navigate(['files']);
  }

  logout(){
    this.router.navigate(['login'])
  }
}



