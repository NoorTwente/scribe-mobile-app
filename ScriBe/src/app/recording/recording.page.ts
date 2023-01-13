
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { RecordingData, VoiceRecorder } from 'capacitor-voice-recorder';
import { interval } from 'rxjs';
import { File, FileNamesList } from '../home/file';
import { Entry, TimeSpan} from '../home/timer';
import { requestHandler } from './httpClient';




@Component({
  selector: 'app-recording',
  templateUrl: './recording.page.html',
  styleUrls: ['./recording.page.scss'],
})

export class RecordingPage implements OnInit {
  //---Recording Variables---//
  isRecording = false;
  isPaused = false;
  //------------------------//
  

  //------Files Stored------//
  files: Map<String, File>;
  storedFileNames; //Files stored in the directory 
  fileRecorded: File;
  //-----------------------//
  
  //-----Audio Play Variables-------//
  audioRef;
  isPlaying=false;
  play = false;
  audioPaused = false;
  //------------------------------//

  //--------Timer varibales--------//
  newId : String;
  entries: Entry[] = [];
  pauseTimerEntry: Entry;
  timespan: TimeSpan;
  pausedSeconds;
  timeDisplayOnPause;
  //------------------------------//

  //--------Server---------------//
  server: requestHandler;
  //--------------  ------------//

  //-----popUp---------//
  popUpDelete = false;
  fileToDelete;
  //------------------//
  


  constructor(private changeDetector: ChangeDetectorRef, private router:Router) {}
  
  
  //Initialises the App
  ngOnInit(){
    this.files = new Map<string, File>();
    this.newId = 'first';
    VoiceRecorder.requestAudioRecordingPermission();
    this.server = new requestHandler();
  }

  //============================================================================================================================
  //                                             For Recording of the audio
  //============================================================================================================================

  //Button to start the recording of the mics
  startRecording(){
    if (!VoiceRecorder.hasAudioRecordingPermission()){
      return;
    }
    if (this.isRecording){
      return; 
    }
    this.isRecording = true;
    VoiceRecorder.startRecording();
    this.addEntry();
    interval(1000).subscribe(() => {
      if(!this.changeDetector['destroyed']){
        this.changeDetector.detectChanges();
      }
    });
    this.changeDetector.detectChanges();
    
  }

  //Button to pause the recording of the mic
  pauseRecording(){
    if (!VoiceRecorder.hasAudioRecordingPermission()){
      return;
    }
    if(!this.isRecording){
      return;
    }
    VoiceRecorder.pauseRecording();
    this.isPaused=true
    this.pauseEntry();
  }

  //Button to resume the reccording of the mic
  resumeRecording(){
    if (!VoiceRecorder.hasAudioRecordingPermission()){
      return;
    }
    if(!this.isRecording){
      return;
    }
    if(!this.isPaused){
      return;
    }
    VoiceRecorder.resumeRecording();
    this.isPaused=false
    this.resumeEntry();
  }


  //Button to stop recording and save it to the local directory
  async stopRecording(){
    if (!VoiceRecorder.hasAudioRecordingPermission()){
      return;
    }
    if(!this.isRecording){
      return;
    }
    VoiceRecorder.stopRecording().then(async (result: RecordingData) => {
      this.isRecording = false;
      this.isPaused=false;
      this.play = true;
      if (result.value && result.value.recordDataBase64){
        const c = result.value;
        const recordData = result.value.recordDataBase64;
        const RecordingMetaData = JSON.stringify(result.value);
        console.log("Recording Saved");
        const fileName = new Date().getTime() + '.wav';
        const t = new Date();
        console.log(t.getTime());
        const f = new File(recordData, fileName,Directory.Data);
        this.fileRecorded = f;
        console.log(RecordingMetaData)
        console.log(fileName);
        console.log(Directory.Data)
        await Filesystem.writeFile({ ////////////////////// writing File to local memory
          path: fileName,
          directory: Directory.Data,
          data: RecordingMetaData,
          encoding: Encoding.UTF16
        }); ////////////////////////////////////////////////////////////////////// 
        const d = this.getDuration();
        FileNamesList.loadFiles(); //loads the new file into the list of files for the all recordings/files page
      }
    })
    // this.removeEntry();
  }

  //Delete the recording from the filesystem Locally
  async deleteRecording(){
    if (this.audioRef != null){
      this.audioRef.pause();
    }  

    await Filesystem.deleteFile({
      directory:Directory.Data,
      path: this.fileRecorded.getName().toString()
    });
    this.fileRecorded = null;
    FileNamesList.loadFiles();
  }

  //Button to record again and delete the previously recorded file
  async recordAgain(){
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    this.closePopUpDelete();
    this.play=false;
    this.isPlaying=false;
    this.isPaused=false;
    this.deleteRecording();
    this.fileRecorded = null;
  }

  recordNewFile(){
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    this.play=false;
    this.isPlaying=false;
    this.isPaused=false;
    this.fileRecorded = null;
  }

  //Button to upload the Audio file to the server and delete from the local memory
  async uploadAudio(fileName=this.fileRecorded){
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    this.isPlaying=false;
    this.isPaused=false;
    this.play=false;
    this.audioPaused=false;
    const f = new File(this.fileRecorded.getAudioFile(), fileName, Directory.Data);
    this.server.upload(this.fileRecorded.getName().toString(), this.fileRecorded.getAudioFile());
    this.deleteRecording();
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


  //============================================================================================================================
  //                                             For Playing of the Audio Recording File
  //============================================================================================================================



  //Play the audio file 
  async playFile() {
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    const base64Sound = this.fileRecorded.getAudioFile();
    this.audioRef = new Audio(`data:audio/aac;base64,${base64Sound}`)
    this.audioRef.oncanplaythrough = () => this.audioRef.play();
    this.audioRef.load();
    console.log("audio played for file" + this.fileRecorded.getName() )
    console.log(this.audioRef.currentTime);
    this.isPlaying=true;
  }

  //Pause button for the playing audio
  pauseFile(){
    this.audioRef.pause();
    this.audioPaused = true;
  }

  //resume the paused audio
  resumeFile(){
    this.audioRef.play();
    this.audioPaused = false;
  }

  stopFile(){
    this.audioRef.pause();
    this.audioRef = null;
  }

  done(){
    if (this.audioRef.duration != Infinity) {
      return true;
    }
    if(this.audioRef.duration == NaN){
      return true;
    }
    else {
      return false;
    }
  }

  

  //============================================================================================================================
  //                                             For Timer on the Recording 
  //============================================================================================================================

  //push a time entry when the recording starts
  addEntry(){
    const d = new Date();
    this.entries.push({
      created: new Date(),
      pausedFor: 0,
      id: this.newId
    });
    this.newId = '';
  }

  //remove a time entry when the recording stops
  removeEntry(){
    this.entries.pop();
  }

  getDuration(){
    const entry = this.entries.pop();
    const totalsec = Math.floor((new Date().getTime() - entry.created.getTime()) / 1000 - entry.pausedFor)
    return totalsec;
  }

  //pause a time entry when the recording pauses
  pauseEntry(){
    this.pauseTimerEntry = this.entries.pop();
    const d = new Date();
    this.pausedSeconds = Math.floor((d.getTime())/1000);
    const t: String = this.getElapsedTime(this.pauseTimerEntry)
    this.timeDisplayOnPause = t;
  }

  //resume a time entry when the resume starts
  resumeEntry(){
    const d = new Date();
    var resumeSeconds= Math.floor((d.getTime())/1000);
    this.pauseTimerEntry.pausedFor += resumeSeconds  - this.pausedSeconds;
    this.entries.push(this.pauseTimerEntry);
  }
  
  //Display the recording time 
  getElapsedTime(entry: Entry): String{
    let totalSeconds = Math.floor((new Date().getTime() - entry.created.getTime()) / 1000 - entry.pausedFor);
    let hours = 0;
    let minutes = 0;
    let seconds = 0;
    if (totalSeconds >= 3600){
      hours = Math.floor(totalSeconds / 3600);
      totalSeconds -= 3600*hours;
    }
    if(totalSeconds >= 60){
      minutes = Math.floor(totalSeconds / 60);
      totalSeconds -= 60 * minutes;
    }
    seconds = totalSeconds;

    return ((minutes).toString().padStart(2, '0') + " : "+ (seconds).toString().padStart(2, '0'));
  }



  //============================================================================================================================
  //                                       Navigation From the Home Page/Recording Page
  //============================================================================================================================
  
  //Buttons for naviagtions:
  
  navigateTofiles(){
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    if(this.isRecording){
      return;
    }
    if(this.isPaused){
      return;
    }
    this.isRecording = false;
    this.play = false;
    this.router.navigate(['files']);
  }

  navigateToHomePage(){
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    if(this.isRecording){
      return;
    }
    if(this.isPaused){
      return;
    }
    this.router.navigate(['home']);
  }

  navigateToInfoPage(){
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    if(this.isRecording){
      return;
    }
    if(this.isPaused){
      return;
    }
    this.router.navigate(['info']);
  }

  logout(){
    if (this.audioRef != null){
      this.audioRef.pause();
    }
    this.router.navigate(['login'])
  }

}
