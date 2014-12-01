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

        /**
         * Formats the disk drive.
         */
        public format(){
             this.hasStorage();
            //has support for local storage?
            if(this.support == 1) {
                this.fsu.format(this.trackSize, this.sectorSize, this.blockSize, this.dataSize, this.hd);
                this.createMBR();
                this.update();
            }
        }

        /**
         * Creates the Master Boot Record
         */
        public createMBR(){
            this.fsu.createMBR(this.hd,this.dataSize,this.file);
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
        public deleteFile(str:string){

            var hexData = this.fsu.stringToHex(str.toString());
            var fileData = this.fsu.padding(hexData,(this.dataSize-4));
            var t = 0;
            var zeroData:string = this.fsu.formatData(this.dataSize);
            var deleted:boolean = false;
            for(var s = 0; s < this.sectorSize;s++){
                for(var b = 0; b<this.blockSize;b++){

                    var key = this.fsu.makeKey(t,s,b);
                    var data:string = this.hd.getItem(key);
                    var fileContents = data.slice(4,data.length);
                    var dataIndex = data.slice(1,4);

                    if(fileContents == fileData){
                        deleted = true;
                        //delete found
                        //need to do error checking.
                        this.hd.setItem(key,zeroData);//set the dir to zero
                        this.hd.setItem(dataIndex,zeroData);//set the data index to zero.
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
         * @param str
         */
        public read(filename){

            var t = 0;
            for(var s = 0; s < this.sectorSize;s++){
                for(var b = 0; b < this.blockSize;b++){

                    if(this.file.has(key)) {
                        var file:TSOS.File = this.file.get(key);
                        if(file.filename == filename){
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

            //first need to make sure
            //that "str" would fit in the file system


            this.fsu.handleWrite(str, this.dataSize-4);



            var t = 0;
            //convert the filename to hex
            var data = this.fsu.stringToHex(filename);
            //add padding to the filename
            var pad  = this.fsu.padding(data,(this.dataSize-4));
            //convert the file contents to hex
            var contents = this.fsu.stringToHex(str);
            //add padding to the file contents
            var padContents = this.fsu.padding(contents,(this.dataSize-4));

            var done:boolean = false;

            for(var s = 0; s<this.sectorSize;s++){
                for(var b = 0; b<this.blockSize;b++){

                    var key = this.fsu.makeKey(t,s,b); //create new key
                    var file = this.hd.getItem(key); // read key contents
                    var filedata = file.slice(4,file.length); //read last 60 bytes

                    if(filedata == pad){
                        var dataIndex = file.slice(1,4); //Get dataIndex
                        var t1 = dataIndex.charAt(0);
                        var t2 = dataIndex.charAt(1);
                        var t3 = dataIndex.charAt(2);
                        var dataKey = this.fsu.makeKey(t1,t2,t3);   // make a new key
                        this.hd.setItem(dataKey,"1###"+padContents);
                        this.file.delete(key);
                        this.file.set(key,new File(filename,str));
                        this.update();
                        done = true;
                        break;
                    }
                }
            }
            if(done){
                _StdOut.putText("Successfully wrote to: "+filename);
            }else{
                _StdOut.putText("Cannot write to file: "+filename+", Please format and try again!");
            }
        }


        /**
         * ls command
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

        public createFile(filename:string){

            /**
             * Able to create file...
             * Need to do serious error checking!!
             */

            //Get dirIndex and dataIndex
            var dirIndex:string = this.fsu.getDirIndex(this.sectorSize,this.blockSize,this.hd);
            var dataIndex:string = this.fsu.getDataIndex(this.sectorSize,this.blockSize,this.hd);

            if(dataIndex != "-1" || dirIndex != "-1") {

                //convert filename to hex
                var data = this.fsu.stringToHex(filename);

                //add padding to the filename
                var actualData:string = this.fsu.padding("1"+dataIndex+data,this.dataSize);
                this.hd.setItem(dirIndex, actualData);//need to add actualData

                var formatData = this.fsu.formatData((this.dataSize-4));
                this.hd.setItem(dataIndex,"1###"+formatData);

                //add to the filename to local  map
                var zeroData:string = this.fsu.formatData(this.dataSize);
                this.file.set(dirIndex,new File(filename,zeroData));

                //update file system
                this.update();

                //print success or failure
                _StdOut.putText("Successfully created file: "+filename);
            }else{
                _StdOut.putText("Could not create the file: "+filename+", Please format and try again!");
            }
        }

        public hasStorage(){
            if('this.hd' in window && window['this.hd'] !== null){
                this.support = 1;
                this.hd = localStorage;
            }else{
                this.support = 0;
            }
        }
    }
}