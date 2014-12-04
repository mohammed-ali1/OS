var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/**
* Created by anwar on 11/26/14.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function (_super) {
        __extends(FileSystem, _super);
        function FileSystem() {
            _super.call(this, this.launch, this.voidMethod);
        }
        FileSystem.prototype.launch = function () {
            this.status = "loaded";
            this.trackSize = 4;
            this.sectorSize = 8;
            this.blockSize = 8;
            this.metaDataSize = 64;
            this.dataSize = 60;
            this.support = 0;
            this.fsu = null;
            FileSystem.DataSize = 64;
            FileSystem.DirSize = 192;
            this.file = new Map();
            this.fsu = new TSOS.FSU();
        };

        FileSystem.prototype.voidMethod = function () {
            //what to do in here.....?
        };

        /**
        * Formats the disk drive.
        */
        FileSystem.prototype.format = function () {
            this.hasStorage();

            //has support for local storage?
            if (this.support == 1) {
                this.fsu.format(this.trackSize, this.sectorSize, this.blockSize, this.metaDataSize, localStorage);
                this.createMBR();
                this.update();
            }
        };

        /**
        * Creates the Master Boot Record
        */
        FileSystem.prototype.createMBR = function () {
            this.fsu.createMBR(localStorage, this.metaDataSize, this.file);
        };

        /**
        * Updates the File System Table
        */
        FileSystem.prototype.update = function () {
            this.fsu.update(this.trackSize, this.sectorSize, this.blockSize, localStorage);
        };

        /**
        * Deletes the file requested.
        * @param str
        */
        FileSystem.prototype.deleteFile = function (str) {
            var hexData = this.fsu.stringToHex(str.toString());
            var fileData = this.fsu.padding(hexData, (this.dataSize));
            var t = 0;
            var zeroData = this.fsu.formatData(this.metaDataSize);
            var deleted = false;
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(t, s, b);
                    var data = localStorage.getItem(key);
                    var fileContents = data.slice(4, data.length);
                    var dataIndex = data.slice(1, 4);

                    if (fileContents == fileData) {
                        deleted = true;

                        //delete found
                        //need to do error checking.
                        localStorage.setItem(key, zeroData); //set the dir to zero
                        localStorage.setItem(dataIndex, zeroData); //set the data index to zero.
                        this.file.delete(key); //delete from the local map
                        this.update();
                    }
                }
            }

            //print success or failure
            if (deleted) {
                _StdOut.putText("Deleted " + str + " Successfully!");
            } else {
                _StdOut.putText("Cannot find the file: " + str);
            }
        };

        /**
        * Read Active files from the Disk
        * @param file
        */
        FileSystem.prototype.read = function (file) {
            var filename = this.fsu.stringToHex(file.toString());
            var pad = this.fsu.padding(filename, this.dataSize);

            //get file index
            var nextMeta = this.fetchFilename(pad);

            if (nextMeta == "###") {
                var a = localStorage.getItem(nextMeta);
                _StdOut.putText(this.fsu.hexToString(a.slice(4, a.length).toString()));
            } else {
                var finalString = this.startPrinting(nextMeta);
                return finalString;
            }
        };

        /**
        * Write to the file
        * @param str
        */
        FileSystem.prototype.writeToFile = function (file, contents, pad) {
            //get the address of the data
            var success = false;
            var hex = this.fsu.stringToHex(file.toString());
            var hexFile = this.fsu.padding(hex, this.dataSize);
            var key = this.fetchDuplicate(hexFile);
            var data = localStorage.getItem(key);
            var dataIndex = data.slice(1, 4);
            var contentsHex;

            //do we want to convert to hex...?
            if (pad) {
                var conv = this.fsu.stringToHex(contents.toString());
                contentsHex = this.fsu.padding(conv, (_BlockSize * 2));
                alert("padded:\n" + contentsHex + "\nlen: " + contentsHex.length);
            } else {
                contentsHex = this.fsu.stringToHex((contents.toString()));
            }

            //what if the contents to write is > 60 bytes
            if (contentsHex.length > (this.dataSize)) {
                this.handleWrite(dataIndex, contentsHex, (this.dataSize));
                success = true;
                this.update();
            } else {
                var padHex = this.fsu.padding(contentsHex, this.dataSize);
                localStorage.setItem(dataIndex, "1###" + padHex);
                success = true;
                this.update();
            }

            if (success) {
                _StdOut.putText("Successfully wrote to: " + file);
            } else {
                _StdOut.putText("Cannot write to file: " + file + ", Please format and try again!");
            }
        };

        /**
        * ls command
        * Use local map to to read all the active files.
        */
        FileSystem.prototype.fileDirectory = function () {
            var t = 0;
            var key;
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = localStorage.getItem(key);
                    var meta = data.slice(0, 1);
                    var hexData = data.slice(4, this.metaDataSize);
                    var stringData = this.fsu.hexToString(hexData);
                    if (meta == "1") {
                        _StdOut.putText(key + ": " + stringData);
                        _Console.advanceLine();
                    }
                }
            }
        };

        /**
        * Able to create file...
        * Need to do serious error checking!!
        */
        FileSystem.prototype.createFile = function (filename) {
            var created = false;

            //convert filename to hex
            var data = this.fsu.stringToHex(filename.toString());

            //add padding to the filename
            var hexData = this.fsu.padding(data, this.dataSize);

            //what if the file size is > 60 bytes...?
            if ((hexData.length) > this.dataSize) {
                _StdOut.putText("Filename must be <= " + (this.dataSize / 2) + " characters!");
                return "-1";
            }

            //Gets un-duplicated key
            var dirIndex = this.getDirIndex();

            if (dirIndex == "-1") {
                _StdOut.putText("Either " + filename + " already exists...Or not enough space!");
                return "-1";
            }

            //Get dataIndex
            var dataIndex = this.fsu.getDataIndex(this.trackSize, this.sectorSize, this.blockSize);

            if (dataIndex != "-1") {
                //                alert("Creating file: dir: "+dirIndex+", dataIndex: "+dataIndex);
                //store in dir address
                localStorage.setItem(dirIndex, ("1" + dataIndex + hexData)); //need to add actualData

                //store "0" in data address
                var formatData = this.fsu.formatData((this.dataSize));
                localStorage.setItem(dataIndex, "1###" + formatData);

                //add to the filename to local  map
                //var zeroData:string = this.fsu.formatData(this.metaDataSize);
                this.file.set(dirIndex, new TSOS.File(filename, ""));

                created = true;

                //update file system
                this.update();
            } else {
                //else data index in -1
                _StdOut.putText("No Space available!, key " + dataIndex);
                return "-1";
            }
            if (created) {
                //print success or failure
                _StdOut.putText("Successfully created file: " + filename);
                _Console.advanceLine();
            } else {
                _StdOut.putText("Could not create the file: " + filename + ", Please format and try again!");
                _Console.advanceLine();
            }
        };

        /**
        * Looks for availale key in DIR Block
        * @param filename
        * @returns {string}
        */
        FileSystem.prototype.getDirIndex = function () {
            var t = 0;
            var key;

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = localStorage.getItem(key);
                    var meta = data.slice(0, 1);
                    if (meta == "0") {
                        return key;
                    }
                }
            }
            return "-1";
        };

        /**
        * Looks for a duplicate filename, if any
        * @param filename
        * @returns {string}
        */
        FileSystem.prototype.fetchDuplicate = function (filename) {
            var t = 0;
            var key;

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = localStorage.getItem(key);
                    var meta = data.slice(0, 1);
                    var hexData = data.slice(4, this.metaDataSize);
                    if ((filename == hexData) && (meta == "1")) {
                        //found duplicate and in use...
                        return key;
                    }
                }
            }
            return "-1";
        };

        /**
        * Looks for filename
        * @param filename
        * @returns {string}
        */
        FileSystem.prototype.fetchFilename = function (filename) {
            var t = 0;
            var key;
            var zero = this.fsu.formatData(this.metaDataSize);
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = localStorage.getItem(key);
                    var inUse = data.slice(0, 1);
                    var meta = data.slice(1, 4);
                    var hexData = data.slice(4, data.length);
                    if ((filename == hexData) && (inUse == "1")) {
                        //found what we are looking for...
                        localStorage.setItem(key, zero);
                        return meta;
                    }
                }
            }
            return "-1";
        };

        FileSystem.prototype.hasStorage = function () {
            if ('localStorage' in window && window['localStorage'] !== null) {
                this.support = 1;
                //                localStorage = sessionStorage;
            } else {
                this.support = 0;
            }
        };

        /**
        * Handles writing to the disk of size > 60 bytes.
        * @param dataIndex
        * @param fileContents
        * @param size
        */
        FileSystem.prototype.handleWrite = function (dataIndex, fileContents, size) {
            var ceiling = Math.ceil(fileContents.length / (size));
            var array = new Array();
            var track = dataIndex.charAt(0);
            var sector = dataIndex.charAt(1);
            var block = dataIndex.charAt(2);
            var stepOut = false;
            array.push(dataIndex);
            var len = fileContents.length;
            var chunkLen;

            for (var t = track; t < this.trackSize; t++) {
                for (var s = sector; s < this.sectorSize; s++) {
                    for (var b = block; b < this.blockSize; b++) {
                        var key = this.fsu.makeKey(t, s, b);
                        var data = localStorage.getItem(key);
                        var dataData = data.slice(0, 4);

                        if (dataData == "0000") {
                            array.push(key);
                        }
                        if (key == "377" && array.length < ceiling) {
                            stepOut = true;
                            _StdOut.putText("Not enough space");
                            return;
                        }
                        if (array.length == ceiling) {
                            stepOut = true;
                            break;
                        }
                    }
                    if (stepOut) {
                        break;
                    }
                }
                if (stepOut) {
                    break;
                }
            }

            var start = 0;
            var end = size;
            var chunk = "";

            for (var a = 0; a < array.length; a++) {
                chunk = fileContents.slice(start, end);
                var key = this.makeFreshKey(array[a]);

                if (a + 1 < array.length) {
                    var nextKey = this.makeFreshKey(array[a + 1]);
                    localStorage.setItem(key, "1" + nextKey + chunk);
                    chunkLen = chunk.length;
                } else {
                    var pad = this.fsu.padding(chunk, size);
                    localStorage.setItem(key, "1###" + pad);
                    chunkLen = pad.length;
                }

                if (end == fileContents.length) {
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
        };

        FileSystem.prototype.makeFreshKey = function (key) {
            var t = key.charAt(0);
            var s = key.charAt(1);
            var b = key.charAt(2);
            return this.fsu.makeKey(t, s, b);
        };

        //load this process into the disk
        FileSystem.prototype.rollOut = function (filename, contents) {
            if (contents.length > (_BlockSize * 2)) {
                _StdOut.putText("Process is bigger than memory block!");
                return;
            } else {
                this.createFile(filename);
                this.writeToFile(filename, contents, true);
            }
        };

        //go to disk, remove a process, store this process
        FileSystem.prototype.rollIn = function (currentProcess, nextProcess) {
            var data;
            var zeroData = this.fsu.formatData(this.metaDataSize);
            var oldContents;

            //search for a filename
            var filename = "swap" + currentProcess.getPid();
            var fileHex = this.fsu.stringToHex(filename.toString());
            var padFile = this.fsu.padding(fileHex, this.dataSize);
            var dataIndex = this.fetchFilename(padFile);

            //get the data of the swap file
            //grab everything in hex!!!!
            data = this.grabAllHex(dataIndex);
            localStorage.setItem(dataIndex, zeroData);

            //grab the whole memory block first
            oldContents = _MemoryManager.grabProcessContents(nextProcess.getBase());

            alert("mem: " + oldContents + "\ndisk: " + data + "\nmem len: " + oldContents.length + ", disk len: " + data.length);

            //create a new file and write to it
            var filename = "swap" + nextProcess.getPid();

            //grab the base and limit
            currentProcess.setBase(nextProcess.getBase());
            currentProcess.setLimit(nextProcess.getLimit());

            //set base limit to -1
            nextProcess.setBase(-1);
            nextProcess.setLimit(-1);

            //now write to file
            this.createFile(filename);
            this.writeToFile(filename, oldContents, false);

            //Now...lets load the memory in the same spot as next process
            _MemoryManager.load(currentProcess.getBase(), data.toString());
            this.update();
        };

        /**
        * returns all the context starting
        * from the index
        * @param index
        */
        FileSystem.prototype.grabAllHex = function (index) {
            var value = "";
            var key;
            var data;
            var nextMeta;
            var zeroData = this.fsu.formatData(this.metaDataSize);
            var stepOut = false;
            var dataData;
            var changeHex;

            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {
                        key = this.fsu.makeKey(t, s, b);
                        data = localStorage.getItem(key);
                        nextMeta = data.slice(1, 4);
                        dataData = data.slice(4, data.length);
                        if (nextMeta == "###") {
                            var len = (_BlockSize - (value.length));
                            changeHex = dataData.slice(4, (4 + len));

                            //                            value += data.slice(4,(4+(len)));
                            localStorage.setItem(key, zeroData); //replace with zeros
                            stepOut = true;
                            break;
                        } else {
                            changeHex = this.fsu.hexToString(dataData);
                            value += changeHex;
                            localStorage.setItem(key, zeroData); //replace with zeros
                        }
                    }
                    if (stepOut) {
                        break;
                    }
                }
                if (stepOut) {
                    break;
                }
            }
            if (stepOut) {
                return value;
            }
        };

        /**
        * Reads all the contents from
        * the start address
        * @param index
        * @returns {string}
        */
        FileSystem.prototype.startReading = function (index) {
            var oldData = "";
            var key;
            var data;
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
                            localStorage.setItem(key, zeroData); //replace with zeros
                            return oldData;
                        } else {
                            oldData += data.slice(4, data.length);
                            localStorage.setItem(key, zeroData); //replace with zeros
                        }
                    }
                }
            }
        };

        /**
        * Look for a filename
        * which begins with "swap"
        * @returns {string|string[]|T[]|Blob}
        */
        FileSystem.prototype.lookForSwapFile = function () {
            var dataIndex;
            var swap = "swap";
            var t = 0;
            var key;
            var dataData;
            var meta;
            var data;
            var hexString;
            var zeroData = this.fsu.format();

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    data = localStorage.getItem(key);
                    meta = data.slice(1, 4);
                    dataData = data.slice(4, 12);
                    hexString = this.fsu.hexToString(dataData);
                    if (hexString == swap) {
                        localStorage.setItem(key, zeroData); //replace with zeros
                        return meta;
                    }
                }
            }
        };

        FileSystem.prototype.startPrinting = function (index) {
            var oldData;
            for (var t = index.charAt(0); t < this.trackSize; t++) {
                for (var s = index.charAt(1); s < this.sectorSize; s++) {
                    for (var b = index.charAt(2); b < this.blockSize; b++) {
                        var key = this.fsu.makeKey(t, s, b);
                        var data = localStorage.getItem(key);
                        var meta = data.slice(1, 4);
                        if (meta == "###") {
                            oldData = data.slice(4, data.length);
                            _StdOut.putText(this.fsu.hexToString(oldData.toString()));
                            return;
                        } else {
                            oldData = data.slice(4, data.length);
                            _StdOut.putText(this.fsu.hexToString(oldData.toString()));
                        }
                    }
                }
            }
        };
        return FileSystem;
    })(TSOS.DeviceDriver);
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
