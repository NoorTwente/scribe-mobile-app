import { Directory, Filesystem } from "@capacitor/filesystem";


export class File{
    file;
    private uploaded: Boolean;
    name: String;
    dir: String;
    created;
    uniqueIDUser;
    selected = false;
    isPlaying = false;
    duration = 0;

    constructor(private f, private n, private d){
        this.file = f;
        this.uploaded = false;
        this.name=n;
        this.dir=d;
        this.created=new Date();
    }



    getDuration(){
        return this.duration;
    }


    getAudioFile(){
        return this.file;
    }

    isUploaded(){
        return this.uploaded;
    }

    uploadFile(){
        this.uploaded = true;
        //upload to the database
    }

    getName(){
        return this.name;
    }

    getTime(){
        return this.created;
    }

    getUniqueIDUser(){
        return this.uniqueIDUser;
    }

    getPath(){
        return (this.dir).toString() + "\\" + this.name;
    }

    getSelected(){
        return this.selected;
    }

    setSelected(f: boolean){
        this.selected=f;
    }

    setPlay(b: boolean){
        this.isPlaying=b;
    }

    getPlay(){
        return this.isPlaying;
    }
    
}

export class FileNamesList{
    static fileNames;

    static async loadFiles(){
        Filesystem.readdir({
          path: '',
          directory: Directory.Data
        }).then(result => {
          this.fileNames = result.files.reverse();
        })
      }



}