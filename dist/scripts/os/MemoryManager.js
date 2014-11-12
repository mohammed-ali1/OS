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
            //                alert("read at: "+parseInt(_CurrentProcess.getBase()+index)+", OP: "+_CPU.IR);
            if (parseInt(_CurrentProcess.getBase() + index) > parseInt(_CurrentProcess.getLimit()) || parseInt(_CurrentProcess.getBase() + index) < parseInt(_CurrentProcess.getBase())) {
                //memory bound interrupt
                _Kernel.krnInterruptHandler(_MemoryBoundError, _CurrentProcess);
            } else {
                return _Memory.read(parseInt(_CurrentProcess.getBase() + index));
            }
        };

        MemoryManager.prototype.store = function (index, str) {
            //            alert("store at: "+parseInt(_CurrentProcess.getBase()+index)+", str: "+str);
            if (parseInt(_CurrentProcess.getBase() + index) > parseInt(_CurrentProcess.getLimit()) || parseInt(_CurrentProcess.getBase() + index) < parseInt(_CurrentProcess.getBase())) {
                //memory bound interrupt
                _Kernel.krnInterruptHandler(_MemoryBoundError, _CurrentProcess);
            } else {
                _Memory.store(parseInt(_CurrentProcess.getBase() + index), str);
            }
        };

        MemoryManager.prototype.load = function (base, str) {
            _Memory.loadProgram(base, str);
        };

        MemoryManager.prototype.clearMemory = function () {
            if (_CurrentProcess.getState() == "Running" || _CurrentProcess.getState() == "Waiting") {
                _StdOut.putText("Let one of the PROCESS Terminate First.....DAmmmmm!");
            } else {
                _StdOut.putText("I had to Clear Memory for you....Thanks a Lot!");
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

        MemoryManager.prototype.getBlockAvailable = function () {
            for (var base = 0; base <= (_BlockSize * 2); base += _BlockSize) {
                var address = _Memory.read(base);
                alert("reading at base: " + base + ", address: " + address);
                if (address == "00") {
                    alert("Returning: " + base);
                    return base;
                }

                for (var j = 0; j < _ResidentQueue.length; j++) {
                    var free = _ResidentQueue[j];
                    if (base == free.getBase() && (free.getState() == "Terminated" || free.getState() == "Killed")) {
                        alert("Return base as: " + free.getBase());
                        return free.getBase();
                    }
                }
            }
            alert("last -1");
            return -1;
        };

        MemoryManager.prototype.getNextBlock = function () {
            if (_ResidentQueue.length >= 3) {
                return -1;
            }
            return parseInt(_ResidentQueue.length * _BlockSize);
        };

        MemoryManager.prototype.getFreeBlock = function () {
            alert("RES: " + _ResidentQueue.length);

            if (_ResidentQueue.length < 3) {
                if (_ResidentQueue.length == 0) {
                    return 0;
                } else if (_ResidentQueue.length == 1) {
                    var s = parseInt(_ResidentQueue[0].getLimit(), 10);
                    return (s + 1);
                } else if (_ResidentQueue.length == 2) {
                    var s = parseInt(_ResidentQueue[1].getLimit(), 10);
                    return (s + 1);
                }
            } else {
                _StdOut.putText("NO ROOM FOR Y0o BITCH!!!");
                return -1;
            }
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
