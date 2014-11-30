/**
* Created by anwar on 11/27/14.
*/
var TSOS;
(function (TSOS) {
    var FSU = (function () {
        /**
        * Utility class for the File System.
        * Some useful methods which can be useful
        * to write the actual file system.
        */
        function FSU() {
        }
        /**
        * Converts String to its hex value
        * @param str
        * @returns {string}
        */
        FSU.prototype.stringToHex = function (str) {
            var s = "";
            for (var i = 0; i < str.length; i++) {
                s += str.charCodeAt(i).toString(16);
            }
            return s;
        };

        /**
        * Converts hex value to String
        * @param str
        * @returns {string}
        */
        FSU.prototype.hexToString = function (str) {
            var s = "";
            for (var i = 0; i < str.length; i++) {
                if (str.charAt(i) != "0") {
                    s += str.charCodeAt(i).toString(10);
                }
            }
            return s;
        };

        /**
        * Adds Padding to the string up to the
        * length parameter.
        * @param str
        * @param length
        * @returns {string}
        */
        FSU.prototype.padding = function (str, length) {
            var temp = "";
            if (str.length > length) {
                return str;
            }

            var i = str.length;
            while (i < length) {
                temp += "0";
                i++;
            }
            str += temp;
            return str;
        };

        /**
        * Formats the data to all zeroes "0".
        * @param size
        * @returns {string}
        */
        FSU.prototype.formatData = function (size) {
            var data = "";
            for (var i = 0; i < size; i++) {
                data += "0";
            }
            return data;
        };

        /**
        * Creates the MBR and adds it to the
        * local storage.
        * @param localStorage
        * @param size
        */
        FSU.prototype.createMBR = function (localStorage, size) {
            var data = this.stringToHex("MBR");
            var pad = this.padding("1###" + data, size);
            var key = this.makeKey(0, 0, 0);
            localStorage.setItem(key, pad);
        };

        /**
        * Creates a local file system.
        * Use this method when format is called.
        */
        FSU.prototype.format = function (trackSize, sectorSize, blockSize, dataSize, localStorage) {
            var storage = this.formatData(dataSize);

            var table = "<table>";
            table += "<th style='text-align: left;'>TSB MBR  Data</th>";

            for (var track = 0; track < trackSize; track++) {
                for (var sector = 0; sector < sectorSize; sector++) {
                    for (var block = 0; block < blockSize; block++) {
                        var key = this.makeKey(track, sector, block);
                        localStorage.setItem(key, storage);
                        var localData = localStorage.getItem(key);
                        var meta = localData.slice(0, 4);
                        var data = localData.slice(4, storage.length);
                        table += "<tr><td>" + track + sector + block + " ";
                        table += meta + " " + data + "</td></tr>";
                    }
                }
            }
            document.getElementById("dirDataTable").innerHTML = table + "</table>";
        };

        /**
        * Updates the FilSystem
        * @param trackSize
        * @param sectorSize
        * @param blockSize
        * @param localStorage
        */
        FSU.prototype.update = function (trackSize, sectorSize, blockSize, localStorage) {
            var table = "<table>";
            table += "<th style='text-align: left;'>TSB MBR  Data</th>";

            for (var t = 0; t < trackSize; t++) {
                for (var s = 0; s < sectorSize; s++) {
                    for (var b = 0; b < blockSize; b++) {
                        var key = this.makeKey(t, s, b);
                        var metadata = localStorage.getItem(key);
                        var meta = metadata.slice(0, 4);
                        var data = metadata.slice(4, metadata.length);
                        table += "<tr><td>" + t + s + b + " ";
                        table += meta + " " + data + "</td></tr>";
                    }
                }
            }
            document.getElementById("dirDataTable").innerHTML = table + "</table>";
        };

        FSU.prototype.makeKey = function (t, s, b) {
            return String(t) + String(s) + String(b);
        };
        return FSU;
    })();
    TSOS.FSU = FSU;
})(TSOS || (TSOS = {}));
