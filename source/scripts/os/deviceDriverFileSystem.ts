/**
 * Created by anwar on 11/26/14.
 */
module TSOS{
    export class FileSystem{

        private trackSize: number = 4;
        private sectorSize:number = 8;
        private blockSize:number = 8;
        private dataSize:number = 64;
        private support:number = 0;
        private hd = null;
        private fsu = null;
        private file = new Map();

        constructor(){
            this.fsu = new FSU();
        }

        public initialize(){

            this.createFile("MOHAMMED");
            this.createFile("ANWAR");
            this.createFile("ALI");
            this.update();
            this.fileDirectory();
            this.writeToFile("MOHAMMED","FIRST COMMIT");
            this.writeToFile("ANWAR","SECOND COMMIT");
            this.update();
            this.read("MOHAMMED");
            this.read("ANWAR");
        }

        /**
         * Formats the disk drive.
         */
        public format(){
            this.hasStorage();
            this.fsu.format(this.trackSize,this.sectorSize,this.blockSize,this.dataSize,this.hd);
            this.createMBR();
            this.update();
        }

        /**
         * Creates the Master Boot Record
         */
        public createMBR(){
            this.fsu.createMBR(this.hd,this.dataSize);
        }

        /**
         * Updates the File System Table
         */
        public update(){
            this.fsu.update(this.trackSize,this.sectorSize,this.blockSize,this.hd);
        }

        /**
         * Deletes the file requested.
         * @param str
         */
        public delete(str){

            var data = this.fsu.stringToHex(str);
            var padding = this.fsu.padding(data,60);

        }


        /**
         * Read Active files from the Disk
         * @param str
         */
        public read(str){

//            alert("size: "+this.file.size);

            var t = 0;
            for(var s = 0; s < this.sectorSize;s++){
                for(var b = 0; b < this.blockSize;b++){
                    var key = this.fsu.makeKey(t,s,b);
                    if(this.file.has(key)) {
                        var file:TSOS.File = this.file.get(key);
                        if(file.filename == str){
                            _StdOut.putText(file.filecontents);
                            _Console.advanceLine();
                            return;
                        }
                    }
                }
            }
        }


        /**
         * Write to the file
         * @param str
         */
        public  writeToFile(filename,str){

            /**
             * Error checking needed
             */

            var t = 0;
            var data = this.fsu.stringToHex(filename);
            var pad  = this.fsu.padding(data,60);

            var contents = this.fsu.stringToHex(str);
            var padContents = this.fsu.padding(contents,60);

            for(var s = 0; s<this.sectorSize;s++){
                for(var b = 0; b<this.blockSize;b++){
                    var key = this.fsu.makeKey(t,s,b);
                    var file = this.hd.getItem(key);
                    var filedata = file.slice(4,file.length);
                    if(filedata == pad){
                        var dataIndex = file.slice(1,4); //index for data
                        var t1 = dataIndex.charAt(0);
                        var t2 = dataIndex.charAt(1);
                        var t3 = dataIndex.charAt(2);
                        var dataKey = this.fsu.makeKey(t1,t2,t3);
                        this.hd.setItem(dataKey,"1###"+padContents);
                        this.file.delete(key);
                        this.file.set(key,new File(filename,str));
                        _StdOut.putText("Successfully wrote to: "+filename);
                        this.update();
                        return;
                    }
                }
            }
        }

        /**
         * ls command
         */
        public fileDirectory(){

            /**
             * Error checking needed
             */

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

        public createFile(str:string){

            /**
             * Able to create file...
             * Need to do serious error checking!!
             */

            if(dataIndex != "-1" && dirIndex != "-1") {
                //convert to hex
                var data = this.fsu.stringToHex(str);
                //add to hd
                var dirIndex:string = this.getDirIndex();
                var dataIndex:string = this.getDataIndex();
                //add padding
                var actualData:string = this.fsu.padding("1"+dataIndex+data,this.dataSize);
                this.hd.setItem(dirIndex, actualData);//need to add actualData

                //add to the file map
                this.file.set(dirIndex,new File(str,"0"));

                //update file system
                this.update();

                //print success
                _StdOut.putText("Successfully created file: "+str);
            }
        }

        public getDirIndex():string{

            for(var s = 0; s<this.sectorSize;s++){
                for(var b=0; b<this.blockSize;b++){
                    var key = this.fsu.makeKey(0,s,b);
                    if(this.hd.getItem(key).slice(0,4) == "0000"){
                        return key;
                    }
                }
            }
            return "-1";
        }

        public getDataIndex():string{

            var formatData = this.fsu.formatData(60);

            for(var s = 0; s<this.sectorSize;s++){
                for(var b = 0; b<this.blockSize;b++){
                    var key = this.fsu.makeKey(1,s,b);
                    if(this.hd.getItem(key).slice(0,4) == "0000"){
                        this.hd.setItem(key,"1###"+formatData);
                        return key;
                    }
                }
            }
            return "-1";
        }

        public hasStorage(){
            if('localStorage' in window && window['localStorage'] !== null){
                this.support = 1;
                this.hd = window.localStorage;
            }else{
                this.support = 0;
            }
        }

        public count(){
           var c = "4d4252000000000000000000000000000000000000000000000000000000";
//            alert("count: "+c.length);
        }
    }
}