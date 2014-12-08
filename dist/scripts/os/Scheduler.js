/**
* Created by anwar on 11/2/14.
*/
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler(schedule) {
            _CurrentSchedule = schedule;
            document.getElementById("currentScheduler").innerHTML = "Current Schedule: " + _CurrentSchedule;
        }
        /**
        * Handles Round Robin Scheduling
        */
        Scheduler.prototype.rr = function () {
            if (_ReadyQueue.getSize() > 0) {
                _ClockCycle = 0;

                _CurrentProcess = _ReadyQueue.dequeue();

                if (_CurrentProcess.getState() == "Ready") {
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                if (_CurrentProcess.getState() == "Memory" && (_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed")) {
                    this.rr();
                }

                if (_CurrentProcess.getLocation() == "Disk") {
                    _Kernel.contextSwitchDisk(true, false, false);
                    return;
                }
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
                _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                TSOS.Shell.updateReadyQueue();
            } else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed") && _ReadyQueue.isEmpty()) {
                _ClockCycle = 0;
                _ResidentQueue.splice(0, _ResidentQueue.length); // clear resident Queue as well!
                TSOS.Shell.updateReadyQueue();
            }
        };

        /**
        * Handles FCFS Scheduling
        */
        Scheduler.prototype.fcfs = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = _ReadyQueue.dequeue();

                //if new process, collect the arrival time
                if (_CurrentProcess.getState() == "Ready") {
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                //if killed or terminated, get the next process
                if (_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed") {
                    this.fcfs();
                }

                if (_CurrentProcess.getLocation() == "Disk") {
                    _Kernel.contextSwitchDisk(false, true, false);
                    return;
                }

                if (_CurrentProcess.getLocation() == "Memory") {
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                    TSOS.Shell.updateReadyQueue();
                }
            } else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed") && _ReadyQueue.isEmpty()) {
                _ResidentQueue.splice(0, _ResidentQueue.length); // clear resident Queue as well!
            }
        };

        /**
        * Handle Priority Scheduling
        */
        Scheduler.prototype.priority = function () {
            if (_ReadyQueue.getSize() > 0) {
                _CurrentProcess = _ReadyQueue.dequeue();

                //if new process, collect the arrival time
                if (_CurrentProcess.getState() == "Ready") {
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                //if killed or terminated, get the next process
                if (_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed") {
                    this.fcfs();
                }

                if (_CurrentProcess.getLocation() == "Disk") {
                    _Kernel.contextSwitchDisk(false, false, true);
                    return;
                }

                if (_CurrentProcess.getLocation() == "Memory") {
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                    TSOS.Shell.updateReadyQueue();
                }
            } else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed") && _ReadyQueue.isEmpty()) {
                _ResidentQueue.splice(0, _ResidentQueue.length); // clear resident Queue as well!
            }
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
