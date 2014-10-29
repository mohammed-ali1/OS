/**
* Created by anwar on 9/28/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            this.programLength = 0;
            this.createTable();
        }
        /**
        * Creates the Memory inside the Table
        */
        Memory.prototype.createTable = function () {
            _MainMemory = new Array();
            _MainMemoryBase = new Array();

            var temp = _MainMemorySize;

            if (temp / _MemoryPartitions == 256 * 1)
                this.segment = 0;
            if (temp / _MemoryPartitions == 256 * 2)
                this.segment = 1;
            if (temp / _MemoryPartitions == 256 * 3)
                this.segment = 2;

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                _MainMemoryBase[i] = i.toString(16).toUpperCase();
                if (i % 256 == 0) {
                    table += "<tr style='background-color: #ffffff;'><td style='font-size: 12px;'>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                } else {
                    table += "<tr><td style='font-size: 12px;'>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
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
            this.programLength = base + (x.length / 2);
            var a = 0, b = 2;

            for (var i = base; i < base + (x.length / 2); i++) {
                var s = x.substring(a, b);
                _MainMemory[i] = s;
                a = b;
                b += 2;
            }

            //            Update the Memory
            this.updateMemory(base.toString());
        };

        /**
        * Updates the Memory with the current base and the length. - add borders to the program input
        */
        Memory.prototype.updateMemory = function (base) {
            alert("Base+Limit: " + (base + length));

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                if (i % 256 == 0) {
                    table += "<tr style='background-color: #ffffff;'><td style='font-size: 12px;'>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                } else {
                    table += "<tr><td style='font-size: 12px;'>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                for (var j = i; j <= i + 7; j++) {
                    if (j + base <= base + this.programLength) {
                        table += "<td style='border: 1px solid;'>" + _MainMemory[j] + "</td>";
                    } else {
                        table += "<td>" + _MainMemory[j] + "</td>";
                    }
                }
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("table").innerHTML = table;
        };

        /**
        * Updates the Memory.
        */
        Memory.prototype.updateMemory = function () {
            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                if (i % 256 == 0) {
                    table += "<tr style='background-color: #ffffff;'><td style='font-size: 12px;'>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                } else {
                    table += "<tr><td style='font-size: 12px;'>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                for (var j = i; j <= i + 7; j++) {
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("table").innerHTML = table;
            this.programLength = -1;
        };

        Memory.prototype.clearMemory = function () {
            for (var i = 0; i < _MainMemorySize; i++) {
                _MainMemory[i] = "00";
            }
            this.programLength = -1;
            this.updateMemory();
        };

        Memory.prototype.size = function () {
            return _MainMemorySize;
        };

        Memory.prototype.getBlock_0 = function () {
            return 0;
        };

        Memory.prototype.getBlock_1 = function () {
            return 256;
        };

        Memory.prototype.getBlock_2 = function () {
            return 512;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
