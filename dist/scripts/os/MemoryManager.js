/**
* Created by anwar on 10/6/14.
*/
var TSOS;
(function (TSOS) {
    var MemoryManager = (function () {
        //Address Translation Coming Soon
        //Prior to Project 3!
        function MemoryManager() {
            _Memory = new TSOS.Memory();
        }
        MemoryManager.prototype.read = function (index) {
            return _Memory.read(index);
        };

        MemoryManager.prototype.store = function (index, str) {
            _Memory.store(index, str);
        };

        MemoryManager.prototype.load = function (base, str) {
            _Memory.loadProgram(base, str);
        };

        MemoryManager.prototype.clearMemory = function () {
            _Memory.clearMemory();
        };

        MemoryManager.prototype.update = function () {
            _Memory.updateMemory();
        };

        MemoryManager.prototype.size = function () {
            return _Memory.size();
        };

        MemoryManager.prototype.getFreeBlock = function () {
            var block0 = _Memory.read(_Memory.getBlock_0());
            var block1 = _Memory.read(_Memory.getBlock_1());
            var block2 = _Memory.read(_Memory.getBlock_2());

            if (block0 == "00") {
                return _Memory.getBlock_0();
            } else if (block0 == "00" && block1 != "00" && block2 != "00") {
                return _Memory.getBlock_0();
            } else if (block0 != "00" && block1 == "00") {
                return _Memory.getBlock_1();
            } else if (block0 != "00" && block1 != "00" && block2 == "00") {
                return _Memory.getBlock_2();
            } else {
                _StdOut.putText("NO ROOM FOR YO BITCH!!!");
                return -1;
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
