/**
 * Created by anwar on 11/2/14.
 */
module TSOS{

   export class Scheduler{

       public scheduler : string[] = ["RR", "FCFS","Priority"];
       public currentScheduler = "";

        constructor(index:number){
            this.currentScheduler = this.scheduler[index];
        }

       /**
        * Starts the Next Available Process int Ready Queue
        */
       public startNewProcess(){

           if(_ReadyQueue.getSize()>0) {

               _CurrentProcess = _ReadyQueue.dequeue();

//               alert("current process: " +_CurrentProcess.getPid());

               if(_CurrentProcess.getState() == "Ready"){
                   _CurrentProcess.setTimeArrived(_OSclock);
               }

               if(_CurrentProcess.getState() == "Terminated" || _CurrentProcess.getState() == "Killed"){
                   alert("Terminate caught: PID: " + _CurrentProcess.getPid());
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
    }
}