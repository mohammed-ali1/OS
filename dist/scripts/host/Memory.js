/**
* Created by anwar on 9/28/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            this.segment = -1;
            this.createTable();
        }
        /**
        * Creates the Memory inside the Table
        */
        Memory.prototype.createTable = function () {
            _MainMemory = new Array();
            _MainMemoryBase = new Array();

            if (_MainMemorySize == 256)
                this.segment = 0;
            if (_MainMemorySize == 256 * 2)
                this.segment = 1;
            if (_MainMemorySize == 256 * 3)
                this.segment = 2;

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                _MainMemoryBase[i] = i.toString(16).toUpperCase();
                table += "<tr><td>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";

                for (var j = i; j <= i + 7; j++) {
                    _MainMemory[j] = "0";
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

        Memory.prototype.store = function (index, str) {
            _MainMemory[index] = str;
        };

        /**
        * Loads the program into the Main Memory
        */
        Memory.prototype.loadProgram = function (str) {
            var x = str.replace(/^\s+|\s+$/g, '');
            x = str.trim();
            var a = 0, b = 2;

            for (var i = _Pcb.base; i < x.length / 2; i++) {
                var s = x.substring(a, b);
                _MainMemory[i] = s;
                a = b;
                b += 2;
            }

            //Update the Memory
            this.updateMemory();
        };

        /**
        * Updates the Memory.
        */
        Memory.prototype.updateMemory = function () {
            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                table += "<tr><td>" + "[" + this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";

                for (var j = i; j <= i + 7; j++) {
                    if (_MainMemory[j] != "0")
                        table += "<td style='background-color: #ffffff;'>" + _MainMemory[j] + "</td>";
                    else
                        table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("table").innerHTML = table;
        };

        Memory.prototype.clear = function () {
            //TO DO
            //Clears the Memory
        };

        Memory.prototype.size = function () {
            return _MainMemorySize;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
