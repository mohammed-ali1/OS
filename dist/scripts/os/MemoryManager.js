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
            if (_ResidentQueue.length == 3) {
                _StdOut.putText("Clearing Memory for you....Thanks a Lot!");
                _Console.advanceLine();
                _Memory.clearMemory();
                _ResidentQueue.splice(0, _ResidentQueue.length);
            } else {
                _StdOut.putText("Let me Terminate First.....DAMmmmm!");
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
            alert("base is: " + parseInt(_ResidentQueue.length * _BlockSize));
            return parseInt(_ResidentQueue.length * _BlockSize);
        };

        MemoryManager.prototype.getFreeBlock = function () {
            //            alert("getting block");
            //
            //            var base = this.getNextBlock();
            //
            //            if(base != -1){
            //                return base;
            //            }
            //
            //            alert("Getting Block");
            //            for(var i=0; i<_ResidentQueue.length;i++){
            //
            //                var temp:TSOS.Pcb = _ResidentQueue[i];
            //
            //                if(temp.getState() == "Terminated" && temp.getInMemory() == true){
            //                    this.clearBlock(temp.getBase());
            //                    base = temp.getBase();
            //                    return base;
            //                }
            //            }
            if (_ResidentQueue.length == 3) {
                this.clearMemory();
            }

            //            return base;
            //Need more thinking here!!!
            alert("RESIDENT: " + _ResidentQueue.length);
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
        };
        return MemoryManager;
    })();
    TSOS.MemoryManager = MemoryManager;
})(TSOS || (TSOS = {}));
