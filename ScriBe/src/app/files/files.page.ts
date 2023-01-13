
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { IonRange} from '@ionic/angular';
import { File, FileNamesList } from '../home/file';
import { requestHandler } from '../recording/httpClient';


@Component({
  selector: 'app-files',
  templateUrl: './files.page.html',
  styleUrls: ['./files.page.scss'],
})
export class FilesPage implements OnInit, AfterViewInit{

  //---------Files Variables-----------//
  files: Map<String, File>; //all files
  fileNames; //Filenames loaded from the local machine
  fileNamesDatabase;
  //----------------------------------//




  //------Audio Player Vairables-------//
  audioPlayingRef;
  isPlaying=false;
  isPaused=false;
  audioPlayer=false;
  playTheFile='';
  knobValue = 0;
  duration = 0;
  public progress = 0;
  @ViewChild('range' , {static: false})range: IonRange;
  //----------------------------------//

  
  //------Upload Vairables----------//
  displayUploadBoxes = false;
  selectedFiles: Map<String, boolean>;
  //-------------------------------//


  //-------Server--------//
  server: requestHandler
  filesInTheDatabase;
  //--------------------//

  //-----popUp---------//
  popUpDelete = false;
  fileToDelete;
  //------------------//
  

  constructor(private router: Router) { 
  }

  ngAfterViewInit(){
    
  }

  ngOnInit() {
    this.files = new Map<String, File>();
    this.selectedFiles = new Map<String, boolean>();
    this.server = new requestHandler();
    FileNamesList.loadFiles();
    this.getFileNamesDatabase();
  }

  //==============================================Load, upload And Delete Files=================================================
  
  //============================================================================================================================

  //get All the filenames stored locally
  getFileNames(){
    return FileNamesList.fileNames;
  }


  //Loads the file Names from the database
  async getFileNamesDatabase(){
    this.fileNamesDatabase = new Array<String>;
    const response = await this.server.getFileNamesServer();
    response.forEach(element => {
      if (!this.fileNamesDatabase.includes(element.filename)){
        this.fileNamesDatabase.push(element.filename)
      }   
    });
    console.log(this.fileNamesDatabase)
  }

  //delete the file from the filesystem
  deleteAudioFileDatabase(filename:String){
    //delete the file from the list of names and correspondingly from the database
    //TO Do
  }

  //Deletes the file from the local memory 
  async deleteAudioFileLocal(fileName=this.fileToDelete){
    if (this.audioPlayingRef != null){
      this.audioPlayingRef.pause();
    }  
    this.closePopUpDelete();
    await Filesystem.deleteFile({
      directory:Directory.Data,
      path: fileName
    });
    FileNamesList.loadFiles();//static file list 
  }

  //loads file from the database
  async loadAudioFileDatabase(fileName){
    //get the audio file from database or loaded filesystem.
    //TO Do
  }

  //display the upload boxes and hide the play and delete buttons
  displayTheBoxes(){
    this.displayUploadBoxes = true;
  }

  //select the file to be uploaded to the cloud
  selectTheFile(fileName){
    this.server.getFileNamesServer();
    if(this.selectedFiles.get(fileName) == true){
      this.selectedFiles.set(fileName, false);
    }
    else{
      this.selectedFiles.set(fileName, true);
    }
    console.log(fileName);
    console.log(this.selectedFiles.get(fileName));
  }

  //upload the file to the database
  async uploadAudio(fileName){
    this.isPlaying=false;
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data,
      encoding: Encoding.UTF16
    });
    const audioJson = JSON.parse(audioFile.data);
    const f = new File(audioJson.recordDataBase64 , fileName, Directory.Data);
    this.server.upload(fileName, audioJson.recordDataBase64);
    this.deleteAudioFileLocal(fileName);
    this.getFileNamesDatabase();
  }

  //upload multiple files to the database
  uploadFiles(){
    this.displayUploadBoxes=false;
    for(var f of this.selectedFiles.keys()){
      if(this.selectedFiles.get(f) == true){
       this.uploadAudio(f);
      }
    }
    this.getFileNamesDatabase();
  }

  //Check if a file is selected for the upload
  isSelected(fileName){  
    return  ((this.files.get(fileName)).getSelected() == true);
  }

  openPopUpDelete(){
    this.popUpDelete = true;
  }

  closePopUpDelete(){
    this.popUpDelete = false;
  }

  fileSelectedToDelete(fileName){
    this.fileToDelete = fileName;
    this.openPopUpDelete();
  }

  cancelDelete(){
    this.closePopUpDelete();
    this.fileToDelete = null;
  }


  //=====================================================Navigation===========================================================

  //============================================================================================================================

  navigateToRecordingPage(){
    this.stopAudioPlayer();
    this.router.navigate(['recording']);
  }

  navigateToHomePage(){
    this.stopAudioPlayer();
    this.router.navigate(['home']);
  }

  navigateToInfoPage(){
    this.stopAudioPlayer();
    this.router.navigate(['info']);
  }

  logout(){
    this.stopAudioPlayer();
    this.router.navigate(['login'])
  }


  
 

  //=====================================================Audio Player===========================================================

  //============================================================================================================================

  async startAudioPlayer(fileName){
    this.playFileLocal(fileName);
    this.audioPlayer=true;
    this.playTheFile=fileName;
  }

  stopAudioPlayer(){
    if(this.isPlaying == false){
      return;
    }
    this.pauseAudioFile();
    this.isPaused=false;
    this.audioPlayer=false;
  }


  //Play the audio file loaded locally
  async playFileLocal(fileName) { 
    if (this.audioPlayingRef != null){
      this.audioPlayingRef.pause();
    } 
    const audioFile = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Data,
      encoding: Encoding.UTF16
    });
    console.log(audioFile.data)
    console.log(fileName);
    console.log(Directory.Data)
    const recordData = JSON.parse(audioFile.data);
    this.duration = recordData.msDuration/1000;
    const base64Sound = recordData.recordDataBase64;
    this.audioPlayingRef = new Audio(`data:audio/aac;base64,${base64Sound}`)
    this.audioPlayingRef.oncanplaythrough = () => {
      this.audioPlayingRef.play();
      this.updateProgress();
    }
    this.audioPlayingRef.load();
    console.log("audio played for file " + fileName )
    this.isPlaying=true;
  }

  //pause the audio file
  async pauseAudioFile(){
    this.isPaused=true;
    this.audioPlayingRef.pause();
    this.isPlaying=false;
  }

  //Resume the audio file that was paused.
  async resumeAudioFile(){
    this.isPaused=false;
    this.audioPlayingRef.play();
    this.isPlaying=true;
  }

  //get the playback time where the parser is whilst reading the audio file.
  getAudioPlayingCurrentTime(){
    this.audioPlayingRef.currentTime;
  }

  //go to the time of the audio playback passed in the argument 
  changeTheAudioPlaybackTime(goTo: number){
    this.audioPlayingRef.currentTime = goTo;
  }

  //forward the audio file
  forward(){
    if (this.audioPlayingRef.currentTime < this.duration){
      this.audioPlayingRef.currentTime += 5;
    }
    if(this.isPaused == true){
      this.resumeAudioFile();
    }
  }

  //reverse 
  reverse(){
    if(this.audioPlayingRef.currentTime < 5){
      this.audioPlayingRef.currentTime = 0;
    }
    else{
      this.audioPlayingRef.currentTime -= 5;
    }
    if(this.isPaused == true){
      this.resumeAudioFile();
    }
  }

  getDuration(){
    return this.duration;
  }

  rangeSelector(event){
    console.log(event.detail.value)
    const percent = (event.detail.value/100);
    this.audioPlayingRef.currentTime = percent * this.duration;
    console.log(this.audioPlayingRef.currentTime);
  }

  setKnob(){
    this.knobValue = this.audioPlayingRef.currentTime;
  }

  audioProgress(){
    console.log(this.audioPlayingRef.currentTime/this.duration)
    return this.audioPlayingRef.currentTime/this.duration;
  }

  audioPlayTimer(){
    if (this.audioPlayingRef == null){
      return;
    }
    let totalSeconds_currentTime = +(Math.round(this.audioPlayingRef.currentTime * 100) / 100).toFixed(0);
    let totalSeconds_duration = +(Math.round(this.duration * 100) / 100).toFixed(0);
    let hours_currentTime  = 0;
    let minutes_currentTime = 0;
    let seconds_currentTime = 0;
    let hours_duration  = 0;
    let minutes_duration = 0;
    let seconds_duration = 0;
    if (totalSeconds_currentTime >= 3600){
      hours_currentTime = Math.floor(totalSeconds_currentTime / 3600);
      totalSeconds_currentTime -= 3600*hours_currentTime;
    }
    if (totalSeconds_duration >= 3600){
      hours_duration = Math.floor(totalSeconds_duration / 3600);
      totalSeconds_duration -= 3600*hours_duration;
    }
    if(totalSeconds_currentTime >= 60){
      minutes_currentTime = Math.floor(totalSeconds_currentTime / 60);
      totalSeconds_currentTime -= 60 * minutes_currentTime;
    }
    if(totalSeconds_duration >= 60){
      minutes_duration = Math.floor(totalSeconds_duration / 60);
      totalSeconds_duration -= 60 * minutes_duration;
    }
    seconds_currentTime = totalSeconds_currentTime;
    seconds_duration = totalSeconds_duration;
    return  (hours_currentTime).toString().padStart(2, '0') + " : "+ (minutes_currentTime).toString().padStart(2, '0') + " : "+ (seconds_currentTime).toString().padStart(2, '0'); 
    // + " | " + ((minutes_duration).toString().padStart(2, '0') + " : "+ (seconds_duration).toString().padStart(2, '0'))
  }

  seek(){
    const v: number = parseFloat(this.range.value.toString());
    const t = (v/100)*this.duration;
    if(t >= this.duration){
      return;
    }
    this.audioPlayingRef.currentTime = t; 
    if(this.isPaused == true){
      this.resumeAudioFile();
    }
    
  }

  updateProgress(){
    this.progress = (this.audioPlayingRef.currentTime/this.duration)*100 || 0;
    if(this.isPlaying){
      this.checkPlaying();
    }
    setTimeout(() => {
      this.updateProgress();
    }, 1000);
  }

  checkPlaying(){
    if (this.audioProgress() == 1){
      this.isPaused=true;
    }
  }


}
