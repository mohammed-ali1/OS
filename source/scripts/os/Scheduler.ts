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
        * Starts the Next Available Process int Ready Queue
        */
       public rr(){

           if(_ReadyQueue.getSize()>0) {

               _CurrentProcess = _ReadyQueue.dequeue();

               if(_CurrentProcess.getState() == "Ready"){
                   _CurrentProcess.setTimeArrived(_OSclock);
               }

               if(_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed"){
                   _ClockCycle = 0;
                   this.rr();
               }

               if(_CurrentProcess.getLocation() == "Disk"){
                    _Kernel.contextSwitch();
               }
               _CurrentProcess.setState(1);
               _CPU.startProcessing(_CurrentProcess);
               _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
               Shell.updateReadyQueue();
           }else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed")
               && _ReadyQueue.isEmpty()){
               _ClockCycle = 0;
               _ResidentQueue.splice(0,_ResidentQueue.length); // clear resident Queue as well!
               return;
           }
       }


       /**
        * FCFS Scheduling
        */
       public fcfs(){

            if(_ReadyQueue.getSize() > 0){
                _CurrentProcess = _ReadyQueue.dequeue();

                //if new process, collect the arrival time
                if(_CurrentProcess.getState() == "Ready"){
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                //if killed or terminated, get the next process
                if(_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed"){
                    this.fcfs();
                }

                if (_CurrentProcess.getLocation() == "Disk") {
                    _Kernel.contextSwitchDisk();
                }

                if(_CurrentProcess.getLocation() == "Memory"){
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
                    Shell.updateReadyQueue();
                }

            }else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed") &&
                _ReadyQueue.isEmpty()) {
                _ResidentQueue.splice(0,_ResidentQueue.length); // clear resident Queue as well!
                return;
            }
       }


       public priority(){

            if(_ReadyQueue.getSize() > 0){
                _CurrentProcess = _ReadyQueue.dequeue();

                //if new process, collect the arrival time
                if(_CurrentProcess.getState() == "Ready"){
                    _CurrentProcess.setTimeArrived(_OSclock);
                }

                //if killed or terminated, get the next process
                if(_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed"){
                    this.fcfs();
                }

                if (_CurrentProcess.getLocation() == "Disk") {
                    _Kernel.contextSwitchDisk();
                }

                if(_CurrentProcess.getLocation() == "Memory"){
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
                    Shell.updateReadyQueue();
                }

            }else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() != "Killed") &&
                _ReadyQueue.isEmpty()) {
                _ResidentQueue.splice(0,_ResidentQueue.length); // clear resident Queue as well!
                return;
            }
       }
    }
}












