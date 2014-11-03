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
        Scheduler.prototype.setCurrentProcess = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = this.getNextProcess();
                _CurrentProcess.setState(1); //set state to "Running"
                _CPU.setCPU(_CurrentProcess);
                _CPU.isExecuting = true;
                _Kernel.krnTrace("PROCESSING PID: " + _CurrentProcess.getPid() + "\n");
            }
        };

        Scheduler.prototype.contextSwitch = function () {
            this.reset();

            if (_CurrentProcess.getState() == "Terminated") {
                this.reset();
            }

            var newProcess = this.getNextProcess();

            if (newProcess == -1) {
                this.reset();
                _CPU.reset();
                _CPU.isExecuting = false;
                _CPU.displayCPU();
            } else {
                this.performSwitch(_CurrentProcess);
                _CurrentProcess = newProcess;
                _Kernel.krnTrace("CONTEXT SWITCH TO PID: " + _CurrentProcess.getPid());
                _CurrentProcess.setState(1);
                _CPU.setCPU(_CurrentProcess);
                _CPU.isExecuting = true;
            }
        };

        Scheduler.prototype.getNextProcess = function () {
            if (_ReadyQueue.getSize() > 0)
                return _ReadyQueue.dequeue();
            return -1;
        };

        Scheduler.prototype.reset = function () {
            _ClockCycle = 0;
            _CurrentProcess.displayPCB();
            _CPU.displayCPU();
        };

        Scheduler.prototype.performSwitch = function (process) {
            if (process.getState() != "Terminated") {
                _CurrentProcess.setPc(_CPU.PC);
                process.setState(2); //set state to waiting
                _ReadyQueue.enqueue(process); //push back to ready queue
                process.displayPCB(); //update display
            }

            if (process.getState() == "Terminated") {
                process.displayPCB();
                this.reset();
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
