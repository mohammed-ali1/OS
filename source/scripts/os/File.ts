/**
 * Created by anwar on 11/29/14.
 */
module TSOS{
    export class File{

        private fileName:string;
        private fileContents:string;

        constructor(public filename:string, public filecontents:string){
            this.fileContents = filename;
            this.fileContents = filecontents;
        }

//        public setFileName(filename){
//            this.fileName = filename;
//        }
//
//        public setFileContents(filecontents){
//            this.fileContents = filecontents;
//        }
//
//        public getFilename():string{
//            return this.fileName;
//        }
//
//        public getFileContents():string{
//            return this.fileContents;
//        }
    }
}