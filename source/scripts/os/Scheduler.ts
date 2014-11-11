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

       public startNewProcess(){

           if(_ReadyQueue.getSize()>0) {

               _CurrentProcess = _ReadyQueue.dequeue();

               alert("current process: " +_CurrentProcess.getPid());

               if(_CurrentProcess.getState() == "Ready"){
                   _CurrentProcess.setTimeArrived(_OSclock);
               }

               if(_CurrentProcess.getState() == "Terminated"){
                   alert("Terminate caught: PID: " + _CurrentProcess.getPid());
                   this.startNewProcess();
               }
               _CurrentProcess.setState(1);
               _CPU.startProcessing(_CurrentProcess);
               _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
               Shell.updateResident();
           }else if ((_CurrentProcess.getState() != "Terminated") && _ReadyQueue.isEmpty()){
               _ClockCycle = 0;
               return;
           }
       }
    }
}