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
                _CurrentProcess = _ReadyQueue.dequeue();
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
                _CPU.isExecuting = true;
                _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
                TSOS.Shell.updateResident();
            } else if (_CurrentProcess.getState() != "Terminated" && _ReadyQueue.isEmpty()) {
                this.reset();
                return;
            }
            //           if(_ReadyQueue.getSize() > 0) {
            //               _CurrentProcess = this.getNextProcess();
            //               if(_CurrentProcess != null) {
            //                   _CurrentProcess.setState(1);//set state to "Running"
            //                   _CPU.startProcessing(_CurrentProcess);
            //               }
            //           }else if (_ReadyQueue.isEmpty() && _CurrentProcess.getState() == "Running"){
            //               this.reset();
            //               _CPU.startProcessing(_CurrentProcess);
            //           }
            //           else{
            //               this.reset();
            //               _CPU.reset();
            //           }
        };

        Scheduler.prototype.contextSwitch = function () {
            this.reset();

            //if nothing on ready queue
            //just reset and move on!
            if (_ReadyQueue.isEmpty() && _CurrentProcess.getState() == "Terminated") {
                _CPU.reset();
                return;
            }

            //           if(_CurrentProcess.getState() == "Terminated"){
            //               _CPU.displayCPU();
            //               _CurrentProcess.displayPCB();
            //               _KernelInterruptQueue.enqueue(new Interrupt(_Break,0));
            //           }
            this.performSwitch();

            _CurrentProcess = _ReadyQueue.dequeue();

            _Kernel.krnTrace("\nCONTEXT SWITCH TO PID: " + _CurrentProcess.getPid() + "\n");
            _CurrentProcess.setState(1); //set state to running
            _CPU.startProcessing(_CurrentProcess);
            _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
            TSOS.Shell.updateResident();
        };

        Scheduler.prototype.reset = function () {
            _ClockCycle = 0;
            _CurrentProcess.displayPCB();
            _CPU.displayCPU();
        };

        Scheduler.prototype.performSwitch = function () {
            _CurrentProcess.setPc(_CPU.PC);
            _CurrentProcess.setAcc(_CPU.Acc);
            _CurrentProcess.setX(_CPU.Xreg);
            _CurrentProcess.setY(_CPU.Yreg);
            _CurrentProcess.setZ(_CPU.Zflag);
            _CurrentProcess.setIr(_CPU.IR);
            _CurrentProcess.setState(2); //set state to waiting
            _ReadyQueue.enqueue(_CurrentProcess); //push back to ready queue
            _CurrentProcess.displayPCB(); //update display
            _CPU.displayCPU();
        };
        return Scheduler;
    })();
    TSOS.Scheduler = Scheduler;
})(TSOS || (TSOS = {}));
