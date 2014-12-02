/**
 * Created by anwar on 11/26/14.
 */
module TSOS{
    export class FileSystem extends DeviceDriver{

        private trackSize: number;
        private sectorSize:number;
        private blockSize:number;
        private dataSize:number;
        private metaDataSize:number;
        private support:number;
        private fsu;
        private file;

        constructor(){
            super(this.launch, this.voidMethod);
        }

        public launch():void{
            this.status = "loaded";
            this.trackSize = 4;
            this.sectorSize = 8;
            this.blockSize = 8;
            this.metaDataSize = 64;
            this.dataSize = 60;
            this.support = 0;
            this.fsu = null;
            this.file = new Map();
            this.fsu = new FSU();
        }

        public voidMethod():void{
            //what to do in here.....?
        }

        /**
         * Formats the disk drive.
         */
        public format(){
             this.hasStorage();
            //has support for local storage?
            if(this.support == 1) {
                this.fsu.format(this.trackSize, this.sectorSize, this.blockSize, this.metaDataSize, localStorage);
                this.createMBR();
                this.update();
            }
        }

        /**
         * Creates the Master Boot Record
         */
        public createMBR(){
            this.fsu.createMBR(localStorage,this.metaDataSize,this.file);
        }

        /**
         * Updates the File System Table
         */
        public update(){
            this.fsu.update(this.trackSize,this.sectorSize,this.blockSize,localStorage);
        }

        /**
         * Deletes the file requested.
         * @param str
         */
        public deleteFile(str:string){

            var hexData = this.fsu.stringToHex(str.toString());
            var fileData = this.fsu.padding(hexData,(this.dataSize));
            var t = 0;
            var zeroData:string = this.fsu.formatData(this.metaDataSize);
            var deleted:boolean = false;
            for(var s = 0; s < this.sectorSize;s++){
                for(var b = 0; b<this.blockSize;b++){

                    var key = this.fsu.makeKey(t,s,b);
                    var data:string = localStorage.getItem(key);
                    var fileContents = data.slice(4,data.length);
                    var dataIndex = data.slice(1,4);

                    if(fileContents == fileData){
                        deleted = true;
                        //delete found
                        //need to do error checking.
                        localStorage.setItem(key,zeroData);//set the dir to zero
                        localStorage.setItem(dataIndex,zeroData);//set the data index to zero.
                        this.file.delete(key);//delete from the local map
                        this.update();
                    }
                }
            }

            if(deleted){
                _StdOut.putText("Deleted "+str+" Successfully!");
            }else{
                _StdOut.putText("Cannot find the file: "+str);
            }
        }


        /**
         * Read Active files from the Disk
         * @param file
         */
        public read(file){

            ///Just use the local map to read the file contents
            //see how simple it is with a local map...?
            var foundFile:boolean = true;
            var t = 0;
            for(var s = 0; s < this.sectorSize;s++){
                for(var b = 0; b < this.blockSize;b++){
                    var key = this.fsu.makeKey(t,s,b);
                    if(this.file.has(key)) {
                        var fileData:TSOS.File = this.file.get(key);
                        if(fileData.filename == file){
                            _StdOut.putText(""+fileData.filecontents);
                            _Console.advanceLine();
                            foundFile = false;
                        }
                    }
                }
            }

            if(foundFile){
                _StdOut.putText("Cannot find the file: "+file);
            }
        }

        /**
         * Write to the file
         * @param str
         */
        public  writeToFile(file,str:string){

            //get the address of the data
            var hex:string;
            var t = 0;
            var dataIndex;
            var success:boolean = false;
            var key;
            var oldData:string;
            var oldHexData:string;
            var fileData:string;
            var formattedData:string = this.fsu.formatData((this.dataSize));

            //use the local map to grab the address of the dataIndex....
            // you can thank me later for creating a local Map!
            for(var s = 0; s<this.sectorSize;s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t,s,b);
                    var data:TSOS.File = this.file.get(key);
                    if(this.file.has(key) && data.filename == file ){
                        dataIndex = localStorage.getItem(key).slice(1,4);
                        //read from the file system...
                        oldData = localStorage.getItem(dataIndex).slice(4,this.metaDataSize);
                        this.file.delete(key);
                        fileData = data.filecontents;
                        fileData += str;
                        this.file.set(key,new File(file,fileData));
                        break;
                    }
                }
            }
            hex = this.fsu.stringToHex(str);
//            //what if we need to append...?
//            if(oldData == formattedData){
//                //in other words...oldData is empty...just add the str
//                hex = this.fsu.stringToHex(str);
//            }else if(){
//                //append if not empty
//
//            }

            //what if the contents to write is > 60 bytes
            if(hex.length > (this.dataSize)){
                this.handleWrite(dataIndex,hex,(this.dataSize));
                success = true;
                this.update();
            }//append to the file
            else{
                //just store it on local storage.
                var padHex = this.fsu.padding(hex,(this.dataSize));
                localStorage.setItem(dataIndex,"1###"+padHex);
                success = true;
                this.update();
            }

            if(success){
                _StdOut.putText("Successfully wrote to: "+file);

            }else{
                _StdOut.putText("Cannot write to file: "+file+", Please format and try again!");
            }
        }


        /**
         * ls command
         * Use local map to to read all the active files.
         */
        public fileDirectory(){

            /**
             * Error checking needed
             */

            if(this.file.size == 0){
                _StdOut.putText("No files are available");
                return;
            }

            for(var s = 0; s < this.sectorSize;s++){
                for(var b = 0; b < this.blockSize;b++){
                    var key = this.fsu.makeKey(0,s,b);
                    if(this.file.has(key)) {
                        var file :TSOS.File = this.file.get(key);
                        var filename:string = file.filename;
                        _StdOut.putText(key +": " + filename);
                        _Console.advanceLine();
                    }
                }
            }
        }

        /**
         * Able to create file...
         * Need to do serious error checking!!
         */
        public createFile(filename:string){

            var dirIndex = this.fetchDuplicate(filename);//Gets un-duplicated key
            if(dirIndex == "-1"){
                _StdOut.putText("File: "+filename+" already exists!");
                return;
            }

            //Get dirIndex and dataIndex
//            var dirIndex:string = this.getDirIndex();
            var dataIndex:string = this.getDataIndex();

            if(dataIndex != "-1" || dirIndex != "-1") {

                //convert filename to hex
                var data = this.fsu.stringToHex(filename);

                //add padding to the filename
                var actualData:string = this.fsu.padding("1"+dataIndex+data,this.metaDataSize);
                localStorage.setItem(dirIndex, actualData);//need to add actualData

                var formatData = this.fsu.formatData((this.dataSize));
                localStorage.setItem(dataIndex,"1###"+formatData);

                //add to the filename to local  map
                //var zeroData:string = this.fsu.formatData(this.metaDataSize);
                this.file.set(dirIndex,new File(filename,""));

                //update file system
                this.update();

                //print success or failure
                _StdOut.putText("Successfully created file: "+filename);
            }else {
                _StdOut.putText("Could not create the file: " + filename + ", Please format and try again!");
            }
        }

        public fetchDuplicate(filename:string){

            var found:boolean = true;
            var hexFilename = this.fsu.stringToHex(filename.toString());
            //what if the file size is > 60 bytes...?
            if(hexFilename.length > (this.dataSize)){
                _StdOut.putText("File Size must be <= "+ this.dataSize);
                return;
            }
            var padHex = this.fsu.padding(hexFilename,this.dataSize);
            var t = 0;
            var key;
            for(var s = 0; s<this.sectorSize;s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t,s,b);
                    var data:string = localStorage.getItem(key);
                    var meta = data.slice(0,1);
                    var hexData:string = data.slice(4,this.dataSize);
                    if((padHex == hexData) && (meta == "1")){
                        //found duplicate and in use...
                        alert("-1: "+key);
                        return "-1";
                    }
                    if(meta == "0"){
                        alert("key: "+key);
                        return key;
                    }
                }
                if(found){
                    break;
                }
            }
            if(found){
                return key;
            }
        }

        public getDirIndex():string{

            var t = 0;
            for(var s = 0; s<this.sectorSize;s++){
                for(var b=0; b<this.blockSize;b++){
                    var key = this.fsu.makeKey(t,s,b);
                    if(localStorage.getItem(key).slice(0,4) == "0000"){
                        return key;
                    }
                }
            }
            return "-1";
        }

        public getDataIndex():string{

            var t = 1;
            for(var s = 0; s<this.sectorSize;s++){
                for(var b = 0; b<this.blockSize;b++){

                    var key = this.fsu.makeKey(t,s,b);
                    if(localStorage.getItem(key).slice(0,4) == "0000"){
                        return key;
                    }
                }
            }
            return "-1";
        }

        public hasStorage(){
            if('localStorage' in window && window['localStorage'] !== null){
                this.support = 1;
//                localStorage = sessionStorage;
            }else{
                this.support = 0;
            }
        }

        /**
         * Handles writing to the disk of size > 60 bytes.
         * @param dataIndex
         * @param fileContents
         * @param size
         */
        public handleWrite(dataIndex,fileContents:string,size){

            var ceiling = Math.ceil(fileContents.length / (this.dataSize));
            var array = new Array();
            var track = dataIndex.charAt(0);
            var sector = dataIndex.charAt(1);
            var block = dataIndex.charAt(2);
            var stepOut:boolean = false;
                array.push(dataIndex);
                block++;

            for(var s = sector; s < this.sectorSize; s++){
                for(var b = block; b < this.blockSize; b++){

                    var key = this.fsu.makeKey(track,s,b);
                    var data = localStorage.getItem(key);
                    var dataData = data.slice(0,4);
                    if(dataData == "0000"){
                        array.push(key);
                    }else if(dataData.slice(0,1) == "1"){
                        ceiling++;
                    }else if(key == "377" && array.length < ceiling){
                        _StdOut.putText("Not Enough Space on Disk");
                        break;
                    }
                    if(array.length == ceiling){
                        stepOut = true;
                        break;
                    }
                }
                if(stepOut){
                    break;
                }
            }

            var start:number = 0;
            var end:number = (this.dataSize);
            var chunk:string = "";
            var temp:string = "";

            //now have fun writing to each address in the array
            for(var a = 0; a < array.length;a++) {
                chunk = fileContents.slice(start, end);
                var key = this.makeFreshKey(array[a]);

                if (a + 1 < array.length) {
                    var nextKey = this.makeFreshKey(array[a + 1]);
                    localStorage.setItem(key, "1"+nextKey + chunk);
                } else {
                    var pad = this.fsu.padding(chunk,size);
                    localStorage.setItem(key, "1###" + pad);
                }

                if(end == fileContents.length){
                    break;
                }

                if ((end + size) > (fileContents.length)) {
                    start = end;
                    end = (fileContents.length);
                } else {
                    start = end;
                    end = (end + size);
                }
            }
            this.update();
        }

        public makeFreshKey(key){
            var t = key.charAt(0);
            var s = key.charAt(1);
            var b = key.charAt(2);
            return this.fsu.makeKey(t,s,b);
        }


        //go into the disk
        public rollIn(){
        }

        //grab from disk
        public rollOut(){
        }
    }
}