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

            //            _ResidentQueue = new Array(); //Don't know how this works
            _ResidentQueue.splice(0, _ResidentQueue.length);
            alert("clearmem - Resident Length: " + _ResidentQueue.length);
            TSOS.Shell.updateResident();
        };

        MemoryManager.prototype.update = function () {
            _Memory.updateMemory();
        };

        MemoryManager.prototype.size = function () {
            return _Memory.size();
        };

        MemoryManager.prototype.getFreeBlock = function () {
            //            var block0 = _Memory.read(_Memory.getBlock_0());
            //            var block1 = _Memory.read(_Memory.getBlock_1());
            //            var block2 = _Memory.read(_Memory.getBlock_2());
            //            if(_ResidentQueue.length == 0){
            //                return 0;
            //            }else if(_ResidentQueue[_ResidentQueue.length-1].getState() !="Running") {
            //                return _ResidentQueue[_ResidentQueue.length - 1].getBlock();
            //            }else{
            //                return -1;
            //            }
            //Need more thinking here!!!
            if (_ResidentQueue.length == 0) {
                return 0;
            } else if (_ResidentQueue.length == 1 && _ResidentQueue[0].getState() != "Running") {
                var s = parseInt(_ResidentQueue[0].getLimit(), 10);
                return (s + 1);
            } else if (_ResidentQueue.length == 2 && _ResidentQueue[1].getState() != "Running") {
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
