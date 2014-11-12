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
        /**
        * Starts the Next Available Process int Ready Queue
        */
        Scheduler.prototype.startNewProcess = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = _ReadyQueue.dequeue();

                //               alert("current process: " +_CurrentProcess.getPid());
                if (_CurrentProcess.getState() == "Ready") {
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                if (_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed") {
                    alert("Terminate caught: PID: " + _CurrentProcess.getPid());
                    _ClockCycle = 0;
                    this.startNewProcess();
                }
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
                _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                TSOS.Shell.updateReadyQueue();
            } else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() == "Killed") && _ReadyQueue.isEmpty()) {
                _ClockCycle = 0;
                return;
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
