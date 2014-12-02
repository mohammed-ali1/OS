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
            ///Just use the local map to read the file contents
            //see how simple it is with a local map...?
            var foundFile = true;
            var t = 0;
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(t, s, b);
                    if (this.file.has(key)) {
                        var fileData = this.file.get(key);
                        if (fileData.filename == file) {
                            _StdOut.putText("" + fileData.filecontents);
                            _Console.advanceLine();
                            foundFile = false;
                        }
                    }
                }
            }

            if (foundFile) {
                _StdOut.putText("Cannot find the file: " + file);
            }
        };

        /**
        * Write to the file
        * @param str
        */
        FileSystem.prototype.writeToFile = function (file, str) {
            //get the address of the data
            var hex;
            var t = 0;
            var dataIndex;
            var success = false;
            var key;
            var oldData;
            var oldHexData;
            var fileData;
            var formattedData = this.fsu.formatData((this.dataSize));

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = this.file.get(key);
                    if (this.file.has(key) && data.filename == file) {
                        dataIndex = localStorage.getItem(key).slice(1, 4);

                        //read from the file system...
                        oldData = localStorage.getItem(dataIndex).slice(4, this.metaDataSize);
                        this.file.delete(key);
                        fileData = data.filecontents;
                        fileData += str;
                        this.file.set(key, new TSOS.File(file, fileData));
                        break;
                    }
                }
            }

            hex = this.fsu.stringToHex(str);

            //what if we need to append...?
            //need to think about it
            //what if the contents to write is > 60 bytes
            if (hex.length > (this.dataSize)) {
                this.handleWrite(dataIndex, hex, (this.dataSize));
                success = true;
                this.update();
            } else {
                //just store it on local storage.
                var padHex = this.fsu.padding(hex, (this.dataSize));
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
            /**
            * Error checking needed
            */
            if (this.file.size == 0) {
                _StdOut.putText("No files are available");
                return;
            }

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(0, s, b);
                    if (this.file.has(key)) {
                        var file = this.file.get(key);
                        var filename = file.filename;
                        _StdOut.putText(key + ": " + filename);
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
            //convert filename to hex
            var data = this.fsu.stringToHex(filename.toString());

            //what if the file size is > 60 bytes...?
            if ((data.length * 2) > 30) {
                _StdOut.putText("Filename must be <= " + (this.dataSize / 2) + " characters!");
                return;
            }

            //add padding to the filename
            var hexData = this.fsu.padding(data, this.dataSize);

            //Gets un-duplicated key
            var dirIndex = this.fetchDuplicate(hexData);

            if (dirIndex == "-1") {
                _StdOut.putText("Either " + filename + " already exists...Or not enough space!");
                return;
            }

            //Get dataIndex
            var dataIndex = this.fsu.getDataIndex();

            if (dataIndex != "-1") {
                //store in dir address
                localStorage.setItem(dirIndex, ("1" + dataIndex + hexData)); //need to add actualData

                //store "0" in data address
                var formatData = this.fsu.formatData((this.dataSize));
                localStorage.setItem(dataIndex, "1###" + formatData);

                //add to the filename to local  map
                //var zeroData:string = this.fsu.formatData(this.metaDataSize);
                this.file.set(dirIndex, new TSOS.File(filename, ""));

                //update file system
                this.update();

                //print success or failure
                _StdOut.putText("Successfully created file: " + filename);
            } else {
                _StdOut.putText("Could not create the file: " + filename + ", Please format and try again!");
            }
        };

        /**
        * Looks for a duplicate filename
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
                        return "-1";
                    } else if (meta == "0") {
                        //not a match...return the key
                        return key;
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
            var ceiling = Math.ceil(fileContents.length / (this.dataSize));
            var array = new Array();
            var track = dataIndex.charAt(0);
            var sector = dataIndex.charAt(1);
            var block = dataIndex.charAt(2);
            var stepOut = false;
            array.push(dataIndex);
            block++;

            for (var s = sector; s < this.sectorSize; s++) {
                for (var b = block; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(track, s, b);
                    var data = localStorage.getItem(key);
                    var dataData = data.slice(0, 4);
                    if (dataData == "0000") {
                        array.push(key);
                    } else if (dataData.slice(0, 1) == "1") {
                        ceiling++;
                    } else if (key == "377" && array.length < ceiling) {
                        _StdOut.putText("Not Enough Space on Disk");
                        break;
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

            var start = 0;
            var end = (this.dataSize);
            var chunk = "";
            var temp = "";

            for (var a = 0; a < array.length; a++) {
                chunk = fileContents.slice(start, end);
                var key = this.makeFreshKey(array[a]);

                if (a + 1 < array.length) {
                    var nextKey = this.makeFreshKey(array[a + 1]);
                    localStorage.setItem(key, "1" + nextKey + chunk);
                } else {
                    var pad = this.fsu.padding(chunk, size);
                    localStorage.setItem(key, "1###" + pad);
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
            this.update();
        };

        FileSystem.prototype.makeFreshKey = function (key) {
            var t = key.charAt(0);
            var s = key.charAt(1);
            var b = key.charAt(2);
            return this.fsu.makeKey(t, s, b);
        };

        //go into the disk
        FileSystem.prototype.rollIn = function () {
        };

        //grab from disk
        FileSystem.prototype.rollOut = function () {
        };
        return FileSystem;
    })(TSOS.DeviceDriver);
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
