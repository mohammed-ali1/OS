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
        private zeroData;
        private static dirSpace:number;
        private static dataSpace:number;

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
            FileSystem.dirSpace = 64;
            FileSystem.dataSpace = 192;
            this.fsu = new FSU();//file system utilities
            this.zeroData = this.fsu.formatData(this.metaDataSize);
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
            this.fsu.createMBR(localStorage,this.metaDataSize);
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
            var dataIndex = this.getFileContents(fileData);
            var zero = this.fsu.formatData(this.metaDataSize);

            if(dataIndex == "###"){
                var a = localStorage.setItem(dataIndex,zero);
            }else{
                this.startDeleting(dataIndex,zero);
            }
        }

        public startDeleting(index,zero){

            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {

                        var key = this.fsu.makeKey(t, s, b);
                        var data = localStorage.getItem(key);
                        var nextKey = data.slice(1, 4);
                        if (nextKey == "###") {
                            localStorage.setItem(key,zero);
                            return;
                        } else {
                            localStorage.setItem(key,zero);
                        }
                        key = nextKey;
                        index = nextKey;
                    }
                }
            }
        }


        /**
         * Read Active files from the Disk
         * @param file
         */
        public read(file){

            var filename = this.fsu.stringToHex(file.toString());
            var pad = this.fsu.padding(filename,this.dataSize);
            //get file index
            var nextMeta = this.getFileContents(pad);

            if(nextMeta == "###"){
                var a = localStorage.getItem(nextMeta);
                _StdOut.putText(this.fsu.hexToString(a.slice(4,a.length).toString()));
            }else{
                this.startPrinting(nextMeta);
            }
        }

        /**
         * Write to the file
         * @param file
         * @param contents
         * @param pad
         */
        public  writeToFile(file,contents,pad:boolean){

            //get the address of the data
            var success:boolean = false;
            var hex = this.fsu.stringToHex(file.toString());
            var hexFile = this.fsu.padding(hex,this.dataSize);
            var key = this.fetchDuplicate(hexFile);
            var data = localStorage.getItem(key);
            var dataIndex = data.slice(1,4);
            var contentsHex = this.fsu.stringToHex(contents.toString());

            //what if the contents to write is > 60 bytes
            if(contentsHex.length > (this.dataSize)){
                var hasSpace:boolean = this.handleWrite(dataIndex,contentsHex,(this.dataSize));
                if(hasSpace){
                    success = true;
                }else{
                    success = false;
                    return success;
                }
            }
            else{
                var padHex = this.fsu.padding(contentsHex,this.dataSize);
                localStorage.setItem(dataIndex,"1###"+padHex);
                success = true;
            }
            this.update();

            var swapFile = file.slice(0,4);
            var swap = "swap";

            //print only if its not a swap-file
            if(success && (swap != swapFile)){
                if(success){
                _StdOut.putText("Successfully wrote to: "+file);
                    return success;
                }else{
                _StdOut.putText("Cannot write to file: "+file+", Please format and try again!");
                    return success;
                }
            }
        }

        /**
         * ls command
         * Use local map to to read all the active files.
         */
        public fileDirectory(){
            var t = 0;
            var key;
            for(var s = 0; s<this.sectorSize;s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t,s,b);
                    var data:string = localStorage.getItem(key);
                    var meta = data.slice(0,1);
                    var hexData:string = data.slice(4,this.metaDataSize);
                    var stringData = this.fsu.hexToString(hexData);
                    if(meta == "1"){
                        _StdOut.putText(key+": "+stringData);
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

            var created: boolean = false;

            //convert filename to hex
            var data = this.fsu.stringToHex(filename.toString());
            //add padding to the filename
            var hexData:string = this.fsu.padding(data,this.dataSize);

            //we don't want file-names of size > 60 Bytes!
            if((hexData.length) > this.dataSize) {
                _StdOut.putText("Filename must be <= " + (this.dataSize / 2) + " characters!");
                return created;
            }

            //Look for a duplicate-filename...first!
            var dirIndex = this.fetchDuplicateFilename(hexData);

            if(dirIndex == "-1"){
                _StdOut.putText("Filename "+filename+" already exists...Or not enough space!");
                return created;
            }

            //Get dataIndex...at this point data
            var dataIndex:string = this.fsu.getDataIndex(this.trackSize,this.sectorSize, this.blockSize);

            if(dataIndex != "-1") {

                //store in dir-Index
                localStorage.setItem(dirIndex, ("1" + dataIndex + hexData));//need to add actualData

                //store "0" in data address
                var formatData = this.fsu.formatData((this.dataSize));
                localStorage.setItem(dataIndex, "1###" + formatData);

                //mark success
                created = true;

                //update file system
                this.update();
            }else{
                //no more storage space
                _StdOut.putText("No Space available to store file-contents!");
                return created;
            }

            var swapFile = filename.slice(0,4);
            var swapFilename = "swap";

            //if we are creating a swap-file...we don't want to print.
            if(created && (swapFilename == swapFile)){
                return created;
            }

            //print success or failure
            if(created){
                _StdOut.putText("Successfully created file: "+filename);
                _Console.advanceLine();
                return created;
            }else {
                _StdOut.putText("Could not create the file: " + filename + ", Please format and try again!");
                _Console.advanceLine();
                return created;
            }
        }

        /**
         * Looks for available key in DIR Block
         * @returns {string}
         */
        public fetchDuplicateFilename(filename){

            var t = 0;
            var key;

            for(var s = 0; s<this.sectorSize;s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t,s,b);
                    var data:string = localStorage.getItem(key);
                    var meta = data.slice(0,1);
                    var dataData = data.slice(4,data.length);
                    if(meta == "1" && (dataData == filename)){
                        return "-1";
                    }
                    else if(meta == "0"){
                        return key;
                    }
                }
            }
            return "-1";
        }

        /**
         * Looks for a duplicate filename, if any
         * @param filename
         * @returns {string}
         */
        public fetchDuplicate(filename:string){

            var t = 0;
            var key;

            for(var s = 0; s<this.sectorSize;s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t,s,b);
                    var data:string = localStorage.getItem(key);
                    var meta = data.slice(0,1);
                    var hexData:string = data.slice(4,this.metaDataSize);
                    if((filename == hexData) && (meta == "1")){
                        //found duplicate and in use...
                        return key;
                    }
                }
            }
            return "-1";
        }

        /**
         * Looks for filename
         * @param filename
         * @returns {string}
         */
        public getFileContents(filename:string){

            var t = 0;
            var key;
            var zero = this.fsu.formatData(this.metaDataSize);
            for(var s = 0; s<this.sectorSize;s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t,s,b);
                    var data:string = localStorage.getItem(key);
                    var inUse = data.slice(0,1);
                    var meta = data.slice(1,4);
                    var hexData:string = data.slice(4,data.length);
                    if((filename == hexData) && (inUse == "1")){
                        //found what we are looking for...
                        localStorage.setItem(key,zero);//delete the contents
                        return meta;
                    }
                }
            }
            return "-1";
        }

        public hasStorage(){
            if('localStorage' in window && window['localStorage'] !== null){
                this.support = 1;
            }else{
                this.support = 0;
            }
        }

        public getAvailableAddresses(first,limit){
            var array = new Array();
                array.push(first);
            var stepOut:boolean = false;

            for(var t = 1; t<this.trackSize; t++) {
                for (var s = 0; s < this.sectorSize; s++) {
                    for (var b = 0; b < this.blockSize; b++) {

                        var key = this.fsu.makeKey(t, s, b);
                        var data = localStorage.getItem(key);
                        var meta = data.slice(0, 1);

                        if((key == "377") && (array.length < (limit))){
//                            _StdOut.putText("Not enough space sorry!");
//                            _Console.advanceLine();
//                            _OsShell.putPrompt();
                            stepOut = true;
                            break;
                        }
                        if (meta == "0") {
                            array.push(key);
                            if(array.length == (limit)){
                                stepOut = true;
                                break;
                            }
                        }
                    }
                    if(stepOut){
                        break;
                    }
                }
                if(stepOut){
                    break;
                }
            }
            return array;
        }

        /**
         * Handles writing to the disk of size > 60 bytes.
         * @param dataIndex
         * @param fileContents
         * @param size
         */
        public  handleWrite(dataIndex, fileContents:string,size){

            var ceiling = Math.ceil(fileContents.length / (size));
            var array = new Array();
            var newKey = this.makeFreshKey(dataIndex);
            //get more keys starting from newKey
            array = this.getAvailableAddresses(newKey,(ceiling-1));
            if(array.length < (ceiling-1)){
                return false;
            }

            var keys = "";
            for(var x =0 ; x<array.length;x++){
                keys += array[x];
                keys += ", ";
            }

            var start:number = 0;
            var end:number = size;
            var chunk:string = "";

            //now load "60" bytes chunk in each address
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
        }

        public makeFreshKey(key){
            var t = key.charAt(0);
            var s = key.charAt(1);
            var b = key.charAt(2);
            return this.fsu.makeKey(t,s,b);
        }


        //load this process into the disk
        public rollOut(filename:string,contents){
            if((contents.length/2) > (_BlockSize)){
                _StdOut.putText("Process is bigger than memory block!");
            }else{
                var created:boolean;
                    created = this.createFile(filename);
                if(created){
                    this.writeToFile(filename,contents,true);
                    return created;
                }else{
                    return created;
                }
            }
        }

        //go to disk, remove a process, store this process
        public rollIn(currentProcess, nextProcess){

            var data: string;
            var zeroData = this.fsu.formatData(this.metaDataSize);
            var oldContents : string;

            //search for a filename
            var filename = "swap"+currentProcess.getPid();
            var fileHex = this.fsu.stringToHex(filename.toString());
            var padFile = this.fsu.padding(fileHex,this.dataSize);
            var dataIndex = this.getFileContents(padFile);
                data = this.grabAllHex(dataIndex); //read current process contents

            localStorage.setItem(dataIndex,zeroData);
            currentProcess.setBase(nextProcess.getBase());
            currentProcess.setLimit(nextProcess.getLimit());
            currentProcess.setBlock(nextProcess.getBlock());
            currentProcess.setLocation("Memory");
            currentProcess.setPrintLocation("Disk -> Memory");
            currentProcess.setState(1);//set state to running
            Shell.updateReadyQueue();

            if(nextProcess.getState() == "Terminated" || nextProcess.getState() == "Killed"){
                this.deleteFile(filename);
                nextProcess.setLocation("Disk");
                nextProcess.setPrintLocation("Memory -> Trash");
                Shell.updateReadyQueue();
            }else{
                filename = "swap"+nextProcess.getPid();
                oldContents = _MemoryManager.copyBlock(nextProcess.getBase());
                nextProcess.setLocation("Disk");
                nextProcess.setPrintLocation("Memory -> Disk");
                nextProcess.setState(2);//waiting
                Shell.updateReadyQueue();
                this.rollOut(filename,oldContents);//just call roll-out here...
//                this.createFile(filename);
//                this.writeToFile(filename,oldContents,false);
            }
            //load back in to memory and continue...
            _MemoryManager.load(currentProcess.getBase(),data.toString());
            this.update();
        }

        /**
         * This method just swaps from the disk and loads
         * into the memory....fcfs
         * @param processOnDisk
         * @param base
         * @returns {string}
         */
        public swap(processOnDisk,base){

            alert("Swapping from the disk");
            var data: string;
            var zeroData = this.fsu.formatData(this.metaDataSize);

            //search for a filename
            var filename = "swap"+processOnDisk.getPid();
            var fileHex = this.fsu.stringToHex(filename.toString());
            var padFile = this.fsu.padding(fileHex,this.dataSize);
            var dataIndex = this.getFileContents(padFile); //don't forget to replace with zeros

            //get the data of the file
            //grab everything in hex!!!!
            data = this.grabAllHex(dataIndex);
            localStorage.setItem(dataIndex,zeroData);

            processOnDisk.setBase(base);
            processOnDisk.setLimit((base+_BlockSize));
            processOnDisk.setBlock((base/_BlockSize));
            processOnDisk
            Shell.updateReadyQueue();

            //load current process into the mem
            _MemoryManager.load(processOnDisk.getBase(),data.toString());
            this.update();
            _MemoryManager.update();
        }


        /**
         * returns all the context starting
         * from the index
         * @param index
         */
        public grabAllHex(index){

            var value = "";
            var key;
            var data :string;
            var nextKey;
            var zeroData = this.fsu.formatData(this.metaDataSize);
            var stepOut:boolean = false;
            var dataData;
            var changeHex;
            var sofar;
            var sofarlen;
            var keys = "";

            for (var t:number = index.charAt(0); t < this.trackSize; t++) {
                for (var s:number = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b:number = index.charAt(2); b < this.blockSize; b++) {

                        key = this.makeFreshKey(index);
                        data = localStorage.getItem(key);
                        nextKey = data.slice(1, 4);
                        dataData = data.slice(4,data.length);
                        if (nextKey == "###") {
                            changeHex = this.fsu.hexToString(dataData);
                            sofar = changeHex;
                            sofarlen = sofar.length;
                            value += changeHex;
                            localStorage.setItem(key, zeroData);//replace with zeros
                            this.update();
                            keys += key;
//                            alert("read at keys: "+keys);
                            stepOut = true;
                            break;
                        } else {
                            changeHex = this.fsu.hexToString(dataData);
                            sofar = changeHex;
                            sofarlen = sofar.length;
                            value += changeHex;
                            localStorage.setItem(key, zeroData);//replace with zeros
                            this.update();
                            keys += key +", ";
                        }
                        index = nextKey;
                    }
                    if(stepOut){
                        break;
                    }
                }
                if(stepOut){
                    break;
                }
            }
            if(stepOut){
                return value;
            }
        }


        /**
         * Reads all the contents from
         * the start address
         * @param index
         * @returns {string}
         */
        public startReading(index){

            var oldData = "";
            var key;
            var data :string;
            var nextMeta;
            var zeroData = this.fsu.formatData(this.metaDataSize);

            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {

                        key = this.fsu.makeKey(t, s, b);
                        data = localStorage.getItem(key);
                        nextMeta = data.slice(1, 4);
                        if (nextMeta == "###") {
                            oldData += data.slice(4, data.length);
                            localStorage.setItem(key, zeroData);//replace with zeros
                            return oldData;
                        } else {
                            oldData += data.slice(4, data.length);
                            localStorage.setItem(key, zeroData);//replace with zeros
                        }
                        key = nextMeta;
                        index = nextMeta;
                    }
                }
            }
        }



        public startPrinting(index){

            var oldData;
            var len = "";
            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {

                        var key = this.fsu.makeKey(t, s, b);
                        var data = localStorage.getItem(key);
                        var nextKey = data.slice(1, 4);
                        if (nextKey == "###") {
                            oldData = data.slice(4, data.length);
                            len += oldData;
                            _StdOut.putText(this.fsu.hexToString(oldData.toString()));
                            _Console.advanceLine();
                            _StdOut.putText("len: "+len.length);
                            return;
                        } else {
                            oldData = data.slice(4, data.length);
                            len +=oldData;
                            _StdOut.putText(this.fsu.hexToString(oldData.toString()));
                        }
                        key = nextKey;
                        index = nextKey;
                    }
                }
            }
        }
    }
}