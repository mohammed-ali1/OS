/**
* Created by anwar on 10/6/14.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        function MemoryManager() {
            _Memory = new TSOS.Memory();
        }
        MemoryManager.prototype.read = function (index) {
            return _Memory.read(index);
        };

        MemoryManager.prototype.store = function (index, str) {
            _Memory.store(index, str);
        };

        MemoryManager.prototype.load = function (str) {
            _Memory.loadProgram(str);
        };

        MemoryManager.prototype.clear = function () {
            _Memory.clear();
        };

        MemoryManager.prototype.update = function () {
            _Memory.updateMemory();
        };

        MemoryManager.prototype.size = function () {
            _Memory.size();
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
