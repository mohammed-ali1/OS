/**
* Created by anwar on 9/28/14.
*/
var TSOS;
(function (TSOS) {
    var Memory = (function () {
        function Memory(location, size) {
            if (typeof size === "undefined") { size = 256; }
            this.location = location;
            this.size = size;
        }
        Memory.prototype.getSize = function () {
            return this.size;
        };

        Memory.createTable = function () {
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
                    _MainMemory[j] = j.toString(16).toUpperCase();
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
