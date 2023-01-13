
export class requestHandler{

    filename = '';
    object: JSON;
    uploadProgress: number;
    

    constructor(){}


    async upload(filename, audioFile){
        try {
            const blob = new Blob([audioFile], {type: 'audio/wav'});
            //----
            console.log(blob)
            const form = new FormData();
            console.log(filename)
            form.append('file', blob, filename);
            console.log(form)
            const response2 = await fetch('https://dev.bmslab.utwente.nl/scribe/api/v1/jobs/audio?encoding=base64', {
                method: 'POST',
                body: form
            })
    
            const data = await response2.json()
            console.log(data) 
        } catch (error) {
            console.log(error)
        }
        

    }

    async getFileNamesServer(){
        const response2 = await fetch('https://dev.bmslab.utwente.nl/scribe/api/v1/jobs', {
            method: 'GET',
        })
        const data = await response2.json();
        console.log(data.jobs)
        return data.jobs;
        
    }

}