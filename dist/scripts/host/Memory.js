/**
* Created by anwar on 9/28/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            this.createTable();
            this.tsb();
        }
        /**
        * Creates the Memory inside the Table
        */
        Memory.prototype.createTable = function () {
            _MainMemory = new Array();
            _MainMemoryBase = new Array();

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                _MainMemoryBase[i] = i.toString(16).toUpperCase();
                if (i % 256 == 0) {
                    Memory.segment++;
                    table += "<tr style='background-color: #ffffff;'><td style='font-size: 12px;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                } else {
                    table += "<tr><td style='font-size: 12px;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }

                for (var j = i; j <= i + 7; j++) {
                    _MainMemory[j] = "00";
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";

            document.getElementById("table").innerHTML = table;
        };

        /**
        * Reads the Memory at the given index
        * @param index
        * @returns {string}
        */
        Memory.prototype.read = function (index) {
            return _MainMemory[index];
        };

        /**
        * Store in memory str, at address index
        * @param index
        * @param str
        */
        Memory.prototype.store = function (index, str) {
            _MainMemory[index] = str;
        };

        /**
        * Loads the program into the Main Memory
        */
        Memory.prototype.loadProgram = function (base, str) {
            var x = str.replace(/^\s+|\s+$/g, '');
            x = str.trim();
            var a = 0, b = 2;

            for (var i = base; i < base + (x.length / 2); i++) {
                var s = x.substring(a, b);
                _MainMemory[i] = s;
                a = b;
                b += 2;
            }

            //            Update the Memory
            this.updateMemory();
        };

        /**
        * Updates the Memory.
        */
        Memory.prototype.updateMemory = function () {
            Memory.segment = -1;

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                if (i % 256 == 0) {
                    Memory.segment++;
                    table += "<tr style='background-color: #ffffff;'><td style='font-size: 12px;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                } else {
                    table += "<tr><td style='font-size: 12px;'>" + "[" + Memory.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                for (var j = i; j <= i + 7; j++) {
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("table").innerHTML = table;
        };

        /**
        * Clears the Memory
        */
        Memory.prototype.clearMemory = function () {
            for (var i = 0; i < _MainMemorySize; i++) {
                _MainMemory[i] = "00";
            }
            this.updateMemory();
        };

        /**
        * Returns the size of the Memory.
        * @returns {number}
        */
        Memory.prototype.size = function () {
            return _MainMemorySize;
        };

        Memory.prototype.tsb = function () {
            this.makeFile();
            //            var count = 0;
            //            //test
            //            var dataTable = "<table>";
            //            dataTable += "<th style='text-align: left;'>TSB</th>";
            //            dataTable += "<th style='text-align: left;'>MBR</th>";
            //            dataTable += "<th style='text-align: left;'>Data</th>";
            //            for(var i=0; i<4;i++) {
            //                for (var j = 0; j < 8; j++) {
            //                    for (var k = 0; k < 8; k++) {
            //                        dataTable += "<tr><td>"+ i + j + k +"</td>";
            //                        dataTable += "<td>";
            //                        for(var t = 0; t<4;t++){
            //                            count++;
            //                            dataTable += 0;
            //                        }
            //                            dataTable += "</td><td>";
            //                                for(var p=0; p < 60; p++){
            //                                dataTable += p + " ";
            //                        }
            //                        dataTable += "</td></tr>";
            //                    }
            //                }
            //            }
            //            alert("COUNT: "+count);
            //            document.getElementById("dirDataTable").innerHTML = dataTable+"</table>";
        };

        Memory.prototype.makeFile = function () {
            var local = window.localStorage;

            var trackSize = 4;
            var sectorSize = 8;
            var blockSize = 8;
            var dataSize = 60;
            var mbrSize = 4;
            var table = "<table>";

            for (var track = 0; track < trackSize; track++) {
                for (var sector = 0; sector < sectorSize; sector++) {
                    for (var block = 0; block < blockSize; block++) {
                        table += "<tr><td>" + track + sector + block + " ";

                        for (var mbr = 0; mbr < mbrSize; mbr++) {
                            table += (mbr * 0);
                        }

                        for (var data = 0; data < dataSize; data++) {
                            table += " " + data;
                        }
                        table += "</td></tr>";
                    }
                }
            }
            document.getElementById("dirDataTable").innerHTML = table + "</table>";
        };
        Memory.segment = -1;
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
