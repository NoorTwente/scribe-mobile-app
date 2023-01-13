
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
            const response2 = await fetch('http://186.189.135.0:5002/jobs', {
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
        const response2 = await fetch('http://186.189.135.0:5002/jobs', {
            method: 'GET',
        })
        const data = await response2.json();
        console.log(data.jobs)
        return data.jobs;
        
    }

}