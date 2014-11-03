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

           if(_ReadyQueue.getSize() > 0) {
               _CurrentProcess = this.getNextProcess();
               _CurrentProcess.setState(1);//set state to "Running"
               _CPU.startProcessing(_CurrentProcess);
               _Kernel.krnTrace("PROCESSING PID: "+_CurrentProcess.getPid()+"\n");
           }
       }

       public contextSwitch(){

           this.reset();

           var newProcess = this.getNextProcess();

           if(newProcess == -1){
               _CurrentProcess.displayPCB();
               _CPU.reset();
               _CPU.displayCPU();
           }else {
               this.performSwitch(_CurrentProcess);
               _CurrentProcess = newProcess;
               _Kernel.krnTrace("\n\nCONTEXT SWITCH TO PID: "+_CurrentProcess.getPid()+"\n\n");
               _CurrentProcess.setState(1);
               _CPU.startProcessing(_CurrentProcess);
               _CPU.isExecuting = true;
           }
       }

       public getNextProcess(){

             if (_ReadyQueue.getSize() > 0){
               return _ReadyQueue.dequeue();
           }else if(_ReadyQueue.getSize() == 0 && _CurrentProcess.getState() != "Terminated"){
               return _CurrentProcess;
           }else{
               return -1;
             }
       }

       public reset(){
           _ClockCycle = 0;
           _CurrentProcess.displayPCB();
           _CPU.displayCPU();
       }

       public performSwitch(process:TSOS.Pcb){

           if(process.getState() != "Terminated"){
               process.setPc(_CPU.PC);
               process.setAcc(_CPU.Acc);
               process.setX(_CPU.Xreg);
               process.setY(_CPU.Yreg);
               process.setZ(_CPU.Zflag);
               process.setIr(_CPU.IR);
               process.setState(2); //set state to waiting
               _ReadyQueue.enqueue(process);//push back to ready queue
               process.displayPCB();//update display
           }

           if (process.getState() == "Terminated"){
               process.displayPCB();
           }
       }
    }
}