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
               if(_CurrentProcess.getState() == "Ready"){
                   _CurrentProcess.setTimeArrived(_OSclock);
               }
               _CurrentProcess.setState(1);
               _CPU.startProcessing(_CurrentProcess);
               _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
               Shell.updateResident();
           }else if (_CurrentProcess.getState() != "Terminated" && _ReadyQueue.isEmpty()){
               this.reset();
               return;
           }
       }

       public contextSwitch(){

           this.reset();

           if(_ReadyQueue.isEmpty() && _CurrentProcess.getState() == "Terminated"){
               _CPU.reset();
               return;
           }

           this.performSwitch();
           _CurrentProcess = _ReadyQueue.dequeue();

           if(_CurrentProcess.getState() == "Ready"){
               _CurrentProcess.setTimeArrived(_OSclock);
               Pcb.displayTimeMonitor();
           }

           if(_CurrentProcess.getState() == "Killed"){
               ///do something...
               alert("killed caught");
               _KernelInterruptQueue.enqueue(new Interrupt(_Killed,0));
               return;
           }
           _Kernel.krnTrace("\nCONTEXT SWITCH TO PID: "+_CurrentProcess.getPid()+"\n");

           _CurrentProcess.setState(1); //set state to running
           _CPU.startProcessing(_CurrentProcess);
           _Kernel.krnTrace("\nPROCESSING PID: "+_CurrentProcess.getPid()+"\n");
           Shell.updateResident();
       }

       public reset(){
           _ClockCycle = 0;
       }

       public performSwitch(){

           _CurrentProcess.setPc(_CPU.PC);
           _CurrentProcess.setAcc(_CPU.Acc);
           _CurrentProcess.setX(_CPU.Xreg);
           _CurrentProcess.setY(_CPU.Yreg);
           _CurrentProcess.setZ(_CPU.Zflag);
           _CurrentProcess.setIr(_CPU.IR);
           _CurrentProcess.setState(2); //set state to waiting
           _ReadyQueue.enqueue(_CurrentProcess);//push back to ready queue
           _CPU.displayCPU();
       }
    }
}