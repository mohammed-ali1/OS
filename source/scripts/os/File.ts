/**
 * Created by anwar on 11/29/14.
 */
module TSOS{
    export class File{

        private fileName:string;
        private fileContents:string;

        constructor(public filename:string, public filecontents:string){
            this.fileName = filename;
            this.fileContents = filecontents;
        }
    }
}