/**
* Created by anwar on 9/28/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory() {
            this.createTable();
        }
        /**
        * Creates the Memory inside the Table
        */
        Memory.prototype.createTable = function () {
            _MainMemory = new Array();

            if (_MainMemorySize == 256)
                _MainMemorySegment++;
            if (_MainMemorySize == 256 * 2)
                _MainMemorySegment++;
            if (_MainMemorySize == 256 * 3)
                _MainMemorySegment++;

            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                table += "<tr class='tr'>";
                _MainMemory[i] = i.toString(16).toUpperCase();
                table += "<td class='td'>" + "[" + _MainMemorySegment + "x" + _MainMemory[i] + "]" + "</td>";

                for (var j = i + 1; j <= i + 7; j++) {
                    _MainMemory[j] = 0;
                    table += "<td class='td'>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";

            document.getElementById("table").innerHTML = table;
        };

        Memory.prototype.clearMemory = function () {
            for (var i = 0; i < _MainMemorySize; i++) {
                _MainMemory[i] = 0;
            }
        };

        /**
        * Loads the program into the Main Memory
        */
        Memory.loadProgram = function (str) {
            var x = str.toString();
            x = x.trim();
            var a = 0, b = 2;

            for (var i = 0; i < str.length; i += 8) {
                for (var j = i + 1; j <= i + 7; j++) {
                    _MainMemory[j] = x.substring(a, b);
                    a = b;
                    b = b + 2;

                    if (_MainMemory[j] == "") {
                        _MainMemory[j] = 0;
                    }
                }
            }
        };

        /**
        * Updates the Memory (called by the setInterval function every 100 ms)
        */
        Memory.updateMemory = function () {
            var table = "<table>";

            for (var i = 0; i < _MainMemorySize; i += 8) {
                table += "<tr class='tr'>";
                table += "<td class='td'>" + "[" + _MainMemorySegment + "x" + _MainMemory[i] + "]" + "</td>";

                for (var j = i + 1; j <= i + 7; j++) {
                    table += "<td class='td'>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("table").innerHTML = table;
        };
        return Memory;
    })();
    TSOS.Memory = Memory;
})(TSOS || (TSOS = {}));