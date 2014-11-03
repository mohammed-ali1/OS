/**
* Created by anwar on 11/2/14.
*/
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler(index) {
            this.scheduler = ["RR", "FCFS", "Priority"];
            this.currentScheduler = "";
            this.currentScheduler = this.scheduler[index];
        }
        Scheduler.prototype.startNewProcess = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = this.getNextProcess();
                _CurrentProcess.setState(1); //set state to "Running"
                _CPU.startProcessing(_CurrentProcess);
                _Kernel.krnTrace("PROCESSING PID: " + _CurrentProcess.getPid() + "\n");
            }
        };

        Scheduler.prototype.contextSwitch = function () {
            var newProcess = this.getNextProcess();

            if (newProcess == -1) {
                _CurrentProcess.displayPCB();
                _CPU.reset();
                _CPU.displayCPU();
            } else {
                this.performSwitch(_CurrentProcess);
                _CurrentProcess = newProcess;
                _Kernel.krnTrace("\n\nCONTEXT SWITCH TO PID: " + _CurrentProcess.getPid() + "\n\n");
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
                _CPU.isExecuting = true;
            }
        };

        Scheduler.prototype.getNextProcess = function () {
            if (_ReadyQueue.getSize() > 0) {
                return _ReadyQueue.dequeue();
            } else if (_ReadyQueue.getSize() == 0 && _CurrentProcess.getState() != "Terminated") {
                return _CurrentProcess;
            } else {
                return -1;
            }
        };

        Scheduler.prototype.reset = function () {
            _ClockCycle = 0;
            _CurrentProcess.displayPCB();
            _CPU.displayCPU();
        };

        Scheduler.prototype.performSwitch = function (process) {
            if (process.getState() != "Terminated") {
                process.setPc(_CPU.PC);
                process.setAcc(_CPU.Acc);
                process.setX(_CPU.Xreg);
                process.setY(_CPU.Yreg);
                process.setZ(_CPU.Zflag);
                process.setIr(_CPU.IR);
                process.setState(2); //set state to waiting
                _ReadyQueue.enqueue(process); //push back to ready queue
                process.displayPCB(); //update display
            }

            if (process.getState() == "Terminated") {
                process.displayPCB();
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
