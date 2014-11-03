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
            }
        };

        Scheduler.prototype.needContextSwitch = function () {
            return _ClockCycle >= _Quantum;
        };

        Scheduler.prototype.contextSwitch = function () {
            var newProcess = this.getNextProcess();

            if (newProcess != null || newProcess != undefined) {
                this.performSwitch(newProcess);
                _CurrentProcess = newProcess;
                _CurrentProcess.setState(1);
                _CPU.setCPU(_CurrentProcess);
                _CPU.isExecuting = true;
            } else if (_CurrentProcess.getState() == "Terminated") {
                this.reset();
            }
        };

        Scheduler.prototype.getNextProcess = function () {
            if (_ReadyQueue.getSize() > 0)
                return _ReadyQueue.dequeue();
            return null;
        };

        Scheduler.prototype.reset = function () {
            _ClockCycle = 0;
            _CPU.isExecuting = false;
            _CurrentProcess.displayPCB();
            _CurrentProcess = null;
        };

        Scheduler.prototype.performSwitch = function (process) {
            if (process.getState() != "Terminated") {
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
