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
            //                alert("read at: "+parseInt(_CurrentProcess.getBase()+index)+", OP: "+_CPU.IR);
            return _Memory.read(parseInt(_CurrentProcess.getBase() + index));
        };

        MemoryManager.prototype.store = function (index, str) {
            //            alert("store at: "+parseInt(_CurrentProcess.getBase()+index)+", str: "+str);
            _Memory.store(parseInt(_CurrentProcess.getBase() + index), str);
        };

        MemoryManager.prototype.load = function (base, str) {
            _Memory.loadProgram(base, str);
        };

        MemoryManager.prototype.clearMemory = function () {
            if (_CurrentProcess.getState() == "Running" || _CurrentProcess.getState() == "Waiting") {
                _StdOut.putText("Let me Terminate First.....DAmmmmm!");
            } else {
                _ResidentQueue.splice(0, _ResidentQueue.length);
                _StdOut.putText("I have to Clear Memory for you....Thanks a Lot!");
                _Console.advanceLine();
                _Memory.clearMemory();
            }
        };

        MemoryManager.prototype.update = function () {
            _Memory.updateMemory();
        };

        MemoryManager.prototype.size = function () {
            return _Memory.size();
        };

        MemoryManager.prototype.clearBlock = function (base) {
            _Memory.clearBlock(base);
        };

        MemoryManager.prototype.getNextBlock = function () {
            if (_ResidentQueue.length >= 3) {
                return -1;
            }
            return parseInt(_ResidentQueue.length * _BlockSize);
        };

        MemoryManager.prototype.getFreeBlock = function () {
            alert("RES: " + _ResidentQueue.length);

            if (_ResidentQueue.length == 3) {
                this.clearMemory();
                return -1;
            }

            if (_ResidentQueue.length < 3) {
                if (_ResidentQueue.length == 0) {
                    return 0;
                } else if (_ResidentQueue.length == 1) {
                    var s = parseInt(_ResidentQueue[0].getLimit(), 10);
                    return (s + 1);
                } else if (_ResidentQueue.length == 2) {
                    var s = parseInt(_ResidentQueue[1].getLimit(), 10);
                    return (s + 1);
                } else {
                    _StdOut.putText("NO ROOM FOR Y0o BITCH!!!");
                    return -1;
                }
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
