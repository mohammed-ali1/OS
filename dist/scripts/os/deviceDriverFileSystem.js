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
            this.fsu.format(this.trackSize, this.sectorSize, this.blockSize, this.dataSize, this.hd);
            this.createMBR();
            this.update();
        };

        /**
        * Creates the Master Boot Record
        */
        FileSystem.prototype.createMBR = function () {
            this.fsu.createMBR(this.hd, this.dataSize);
        };

        /**
        * Updates the File System Table
        */
        FileSystem.prototype.update = function () {
            this.fsu.update(this.trackSize, this.sectorSize, this.blockSize, this.hd);
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
                    var data = this.hd.getItem(key);
                    var fileContants = data.slice(4, data.length);
                    var dataIndex = data.slice(1, 4);

                    if (fileContants == fileData) {
                        deleted = true;

                        //delete found
                        //need to do error checking.
                        this.hd.setItem(key, zeroData); //set the dir to zero
                        this.hd.setItem(dataIndex, zeroData); //set the data index to zero.
                        this.file.delete(key);
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
            //            alert("size: "+this.file.size);
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
        FileSystem.prototype.writeToFile = function (filename, str) {
            /**
            * Error checking needed
            */
            var t = 0;

            //convert the filename to hex
            var data = this.fsu.stringToHex(filename);

            //add padding to the filename
            var pad = this.fsu.padding(data, (this.dataSize - 4));

            //convert the file contents to hex
            var contents = this.fsu.stringToHex(str);

            //add padding to the file contents
            var padContents = this.fsu.padding(contents, (this.dataSize - 4));

            var done = false;

            for (var s = 0; s < this.sectorSize; s++) {
                for (var b = 0; b < this.blockSize; b++) {
                    var key = this.fsu.makeKey(t, s, b);
                    var file = this.hd.getItem(key);
                    var filedata = file.slice(4, file.length);

                    if (filedata == pad) {
                        var dataIndex = file.slice(1, 4);
                        var t1 = dataIndex.charAt(0);
                        var t2 = dataIndex.charAt(1);
                        var t3 = dataIndex.charAt(2);
                        var dataKey = this.fsu.makeKey(t1, t2, t3);
                        this.hd.setItem(dataKey, "1###" + padContents);
                        this.file.delete(key);
                        this.file.set(key, new TSOS.File(filename, str));
                        this.update();
                        done = true;
                        break;
                    }
                }
            }
            if (done) {
                _StdOut.putText("Successfully wrote to: " + filename);
            } else {
                _StdOut.putText("Cannot write to file: " + filename + ", Please format and try again!");
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
                this.hd.setItem(dirIndex, actualData); //need to add actualData

                var formatData = this.fsu.formatData((this.dataSize - 4));
                this.hd.setItem(dataIndex, "1###" + formatData);

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

                    if (this.hd.getItem(key).slice(0, 4) == "0000") {
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

                    if (this.hd.getItem(key).slice(0, 4) == "0000") {
                        return key;
                    }
                }
            }
            return "-1";
        };

        FileSystem.prototype.hasStorage = function () {
            if ('localStorage' in window && window['localStorage'] !== null) {
                this.support = 1;
                this.hd = window.localStorage;
            } else {
                this.support = 0;
            }
        };
        return FileSystem;
    })();
    TSOS.FileSystem = FileSystem;
})(TSOS || (TSOS = {}));
