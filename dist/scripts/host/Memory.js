/**
* Created by anwar on 9/28/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
        }
        /**
        * Creates the Memory inside the Table
        */
        Memory.prototype.createTable = function () {
            _MainMemory = new Array();
            _MainMemoryBase = new Array();

            if (_MainMemorySize == 256)
                _MainMemorySegment++;
            if (_MainMemorySize == 256 * 2)
                _MainMemorySegment++;
            if (_MainMemorySize == 256 * 3)
                _MainMemorySegment++;

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                _MainMemoryBase[i] = i.toString(16).toUpperCase();
                table += "<tr><td>" + "[" + _MainMemorySegment + "x" + _MainMemoryBase[i] + "]" + "</td>";

                for (var j = i; j <= i + 7; j++) {
                    _MainMemory[j] = "$$";
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";

            document.getElementById("table").innerHTML = table;
        };

        /**
        * Clears the Main Memory.
        */
        Memory.prototype.clearMemory = function () {
            for (var i = 0; i < _MainMemorySize; i++) {
                _MainMemory[i] = "00";
            }

            this.updateMemory();
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
                table += "<tr><td>" + "[" + _MainMemorySegment + "x" + _MainMemoryBase[i] + "]" + "</td>";

                for (var j = i; j <= i + 7; j++) {
                    if (_MainMemory[j] != "$$")
                        table += "<td style='background-color: #ffffff;'>" + _MainMemory[j] + "</td>";
                    else
                        table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("table").innerHTML = table;
        };

        Memory.prototype.size = function () {
            return _MainMemorySize;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));
