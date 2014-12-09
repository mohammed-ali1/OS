/**
 * Created by anwar on 11/2/14.
 */
module TSOS{

   export class Scheduler{

        constructor(schedule:string){
            _CurrentSchedule = schedule;
            document.getElementById("currentScheduler").innerHTML = "Current Schedule: " + _CurrentSchedule;
        }

       /**
        * Handles Round Robin Scheduling
        */
       public startProcess() {

           if (_ReadyQueue.getSize() > 0) {

               _CurrentProcess = _ReadyQueue.dequeue();

               if (_CurrentProcess.getState() == "Ready") {
                   _CurrentProcess.setTimeArrived(_OSclock);
               }

               if(_CurrentProcess.getState() == "Memory" && (_CurrentProcess.getState() == "Terminated"
                                                    || _CurrentProcess.getState() == "Killed")){
                    this.startProcess();
               }

               if ((_CurrentProcess.getLocation() == "Disk") && (_CurrentSchedule == "rr")) {
                    _Kernel.contextSwitchDisk(true,false,false);
                   return;
               }
               if ((_CurrentProcess.getLocation() == "Disk") && (_CurrentSchedule == "fcfs")) {
                    _Kernel.contextSwitchDisk(false,true,false);
                   return;
               }
               if ((_CurrentProcess.getLocation() == "Disk") && (_CurrentSchedule == "priority")) {
                    _Kernel.contextSwitchDisk(false,false,true);
                   return;
               }

               _CurrentProcess.setState(1);
               _CPU.startProcessing(_CurrentProcess);
               _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
               Shell.updateReadyQueue();

               } else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed")
                   && _ReadyQueue.isEmpty()) {
                   _ClockCycle = 0;
                   _ResidentQueue.splice(0, _ResidentQueue.length); // clear resident Queue as well!
                    Shell.updateReadyQueue();
               }
           }
    }
}












