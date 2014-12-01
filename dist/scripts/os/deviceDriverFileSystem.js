/**
* Created by anwar on 11/26/14.
*/
var TSOS;
(function (TSOS) {
    var FileSystem = (function () {
        function FileSystem() {
            this.trackSize = 4;
            this.sectorSize = 8;
            this.blockSize = 8;
            this.dataSize = 64;
            this.support = 0;
            this.hd = null;
            this.fsu = null;
            this.file = new Map();
            this.fsu = new TSOS.FSU();
        }
        /**
        * Formats the disk drive.
        */
        FileSystem.prototype.format = function () {
            this.hasStorage();

            //has support for local storage?
            if (this.support == 1) {
                this.fsu.format(this.trackSize, this.sectorSize, this.blockSize, this.dataSize, localStorage);
                this.createMBR();
                this.update();
            }
        };

        /**
        * Creates the Master Boot Record
        */
        FileSystem.prototype.createMBR = function () {
            this.fsu.createMBR(localStorage, this.dataSize, this.file);
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
            var fileData = this.fsu.padding(hexData, (this.dataSize - 4));
            var t = 0;
            var zeroData = this.fsu.formatData(this.dataSize);
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

            if (deleted) {
                _StdOut.putText("Deleted " + str + " Successfully!");
            } else {
                _StdOut.putText("Cannot find the file: " + str);
            }
        };

        /**
        * Read Active files from the Disk
        * @param str
        */
        FileSystem.prototype.read = function (str) {
            var t = 0;
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(t, s, b);
                    if (this.file.has(key)) {
                        var file = this.file.get(key);
                        if (file.filename == str) {
                            _StdOut.putText(file.filecontents);
                            _Console.advanceLine();
                            return;
                        }
                    }
                }
            }
        };

        /**
        * Write to the file
        * @param str
        */
        FileSystem.prototype.writeToFile = function (file, str) {
            /**
            * Error checking needed
            */
            //get the address of the data
            var hex = this.fsu.stringToHex(str);
            var t = 0;
            var dataIndex;
            var success = false;
            var key;

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    key = this.fsu.makeKey(t, s, b);
                    var data = this.file.get(key);
                    if (this.file.has(key) && data.filename == file) {
                        dataIndex = localStorage.getItem(key).slice(1, 4);
                        this.file.delete(key);
                        var fileData = data.filecontents;
                        fileData += str;
                        this.file.set(key, new TSOS.File(file, fileData));
                        break;
                    }
                }
            }

            //what if the contents to write is > 60 bytes
            if (hex.length > (this.dataSize - 4)) {
                this.handleWrite(dataIndex, file, str);
                success = true;
                this.update();
            } else {
                //just store it on local storage.
                var padHex = this.fsu.padding(hex, (this.dataSize - 4));
                localStorage.setItem(dataIndex, "1###" + padHex);

                //get whats in file first so we can append.
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

        FileSystem.prototype.createFile = function (filename) {
            /**
            * Able to create file...
            * Need to do serious error checking!!
            */
            if (dataIndex != "-1" || dirIndex != "-1") {
                //convert filename to hex
                var data = this.fsu.stringToHex(filename);

                //Get dirIndex and dataIndex
                var dirIndex = this.getDirIndex();
                var dataIndex = this.getDataIndex();

                //add padding to the filename
                var actualData = this.fsu.padding("1" + dataIndex + data, this.dataSize);
                localStorage.setItem(dirIndex, actualData); //need to add actualData

                var formatData = this.fsu.formatData((this.dataSize - 4));
                localStorage.setItem(dataIndex, "1###" + formatData);

                //add to the filename to local  map
                var zeroData = this.fsu.formatData(this.dataSize);
                this.file.set(dirIndex, new TSOS.File(filename, zeroData));

                //update file system
                this.update();

                //print success or failure
                _StdOut.putText("Successfully created file: " + filename);
            } else {
                _StdOut.putText("Could not create the file: " + filename + ", Please format and try again!");
            }
        };

        FileSystem.prototype.getDirIndex = function () {
            var t = 0;
            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(t, s, b);

                    if (localStorage.getItem(key).slice(0, 4) == "0000") {
                        return key;
                    }
                }
            }
            return "-1";
        };

        FileSystem.prototype.getDataIndex = function () {
            var t = 1;

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(t, s, b);

                    if (localStorage.getItem(key).slice(0, 4) == "0000") {
                        return key;
                    }
                }
            }
            return "-1";
        };

        FileSystem.prototype.hasStorage = function () {
            if ('localStorage' in window && window['localStorage'] !== null) {
                this.support = 1;
            } else {
                this.support = 0;
            }
        };

        FileSystem.prototype.handleWrite = function (dataIndex, filename, fileContents) {
            var hex = this.fsu.stringToHex(fileContents);
            var ciel = Math.ceil(hex.length / (this.dataSize - 4));
            var array = new Array();
            var track = dataIndex.charAt(0);
            var sector = dataIndex.charAt(1);
            var block = dataIndex.charAt(2);
            array.push(dataIndex);

            for (var t = track; t < this.trackSize; t++) {
                for (var s = sector; s < this.trackSize; s++) {
                    for (var b = block; b < this.trackSize; b++) {
                        if (array.length == ciel) {
                            break;
                        }
                        var key = this.fsu.makeKey(t, s, b);
                        var data = localStorage.getItem(key);
                        var dataData = data.slice(0, 4);
                        if (dataData == "0000") {
                            array.push(key);
                        }
                    }
                }
            }

            _StdOut.putText("Cie: " + ciel);
            _Console.advanceLine();
            for (var a = 0; a < array.length; a++) {
                _StdOut.putText(array[a]);
                _Console.advanceLine();
            }
        };
        return FileSystem;
    })();
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
