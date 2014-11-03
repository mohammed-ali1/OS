/**
* Created by anwar on 11/2/14.
*/
var TSOS;
(function (TSOS) {
    var Scheduler = (function () {
        function Scheduler() {
            this.scheduler = ["RR", "FCFS", "Priority"];
            this.switch = false;
            this.current = "";
            alert("Constructor Called");
            this.current = this.scheduler[0].toString();
            this.timer = 0;
            this.switch = false;
            this.RR();
        }
        Scheduler.prototype.needContextSwitch = function () {
            if ((_CurrentProcess.getState() == "Terminated") && (this.timer == _Quantum)) {
                this.timer = 0;
                this.switch = true;
            }

            if (this.timer == _Quantum && _CurrentProcess.getState() == "Running") {
                _CurrentProcess.setState(2); //Save the state of the Process
                this.switch = true; //set context switch to true
                this.timer = 0;
            }

            if (this.timer < _Quantum) {
                this.switch = false;
            }

            alert("Timer is: " + this.timer.toString() + ", Switch is: " + this.switch.toString() + ", Process: " + _CurrentProcess.getPid());
        };

        Scheduler.prototype.RR = function () {
            alert("RR Called");

            while (this.timer != _Quantum) {
                this.timer++;
                alert("Timer is: " + this.timer);
                this.needContextSwitch();

                if (this.switch) {
                    _ReadyQueue.enqueue(_CurrentProcess);
                } else {
                    for (var i = 0; i < _ResidentQueue.length; i++) {
                        if (_ResidentQueue[i].getState() == "New") {
                            _ReadyQueue.enqueue(_ResidentQueue[i]); //Get the next new process
                            break;
                        }
                    }
                }
            }
        };

        Scheduler.prototype.schedulerExe = function (p) {
            _CurrentProcess = p;
            _Kernel.krnTrace("Processing PID: " + _CurrentProcess.getPid());
            _StdOut.putText("Processing PID: " + _CurrentProcess.getPid());
            _Console.advanceLine();
            _OsShell.putPrompt();
            _CPU.isExecuting = true;
            _CPU.PC = _CurrentProcess.getBase();
            _CPU.displayCPU();
            _CurrentProcess.setState(1); //set state "Running"
            TSOS.Shell.updateResident();
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
