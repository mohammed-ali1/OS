/**
 * Created by anwar on 11/2/14.
 */
module TSOS{

   export class Scheduler{


        constructor(schedule:string){
//            _CurrentSchedule = schedule;
        }

       /**
        * Starts the Next Available Process int Ready Queue
        */
       public startNewProcess(){

           if(_ReadyQueue.getSize()>0) {

               _CurrentProcess = _ReadyQueue.dequeue();

               if(_CurrentProcess.getState() == "Ready"){
                   _CurrentProcess.setTimeArrived(_OSclock);
               }

               if(_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed"){
                   _ClockCycle = 0;
                   this.startNewProcess();
               }
               _CurrentProcess.setState(1);
               _CPU.startProcessing(_CurrentProcess);
               _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
               Shell.updateReadyQueue();
           }else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() == "Killed") && _ReadyQueue.isEmpty()){
               _ClockCycle = 0;
               return;
           }
       }


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
                    _CurrentProcess.setLocation("Memory");
                    _CurrentProcess.setPrintLocation("Disk -> Memory");
                    //load it into block 0 bc...fcfs
                    _FileSystem.swap(_CurrentProcess, 0);
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                }

                if(_CurrentProcess.getLocation() == "Memory"){
                    //set state to running and process it
                    _CurrentProcess.setState(1);
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
                    Shell.updateReadyQueue();
                }

            }else if ((_CurrentProcess.getState() != "Terminated" || _CurrentProcess.getState() == "Killed") &&
                _ReadyQueue.isEmpty()) {

                if (_CurrentProcess.getLocation() == "Disk") {
                    _CurrentProcess.setLocation("Memory");
                    //load it into block 0 bc...ready queue is empty
                    _FileSystem.swap(_CurrentProcess, 0);
                    _CPU.startProcessing(_CurrentProcess);
                }
            }else if(_ReadyQueue.isEmpty()){
                _CPU.reset();
            }
       }
    }
}












