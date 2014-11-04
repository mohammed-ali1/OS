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
               if(_CurrentProcess != null) {
                   _CurrentProcess.setState(1);//set state to "Running"
                   _CPU.startProcessing(_CurrentProcess);
                   _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
               }
           }else{
               this.reset();
               _CPU.reset();
           }
       }

       public contextSwitch(){

//           alert("in switch pid:"+_CurrentProcess.getPid());

           this.reset();

           if(_CurrentProcess.getState() !="Terminated"){
               this.performSwitch();
           }

           var newProcess = this.getNextProcess();

           if(newProcess == null){
               _CurrentProcess.displayPCB();
               _CPU.reset();
               _CPU.displayCPU();
               return;
           }else{
               _CurrentProcess = newProcess;
               _Kernel.krnTrace("\nCONTEXT SWITCH TO PID: "+_CurrentProcess.getPid()+"\n");
               _CurrentProcess.setState(1); //set state to running
               _CPU.startProcessing(_CurrentProcess);
           }
       }

       public getNextProcess(){
           if (_ReadyQueue.getSize() > 0) {
               return _ReadyQueue.dequeue();
           }else{
               return null;
           }
       }

       public reset(){
           _ClockCycle = 0;
           _CurrentProcess.displayPCB();
           _CPU.displayCPU();
       }

       public performSwitch(){

           if(_CurrentProcess.getState() != "Terminated"){
//               alert("state before: "+_CurrentProcess.getState());
               _CurrentProcess.setPc(_CPU.PC);
               _CurrentProcess.setAcc(_CPU.Acc);
               _CurrentProcess.setX(_CPU.Xreg);
               _CurrentProcess.setY(_CPU.Yreg);
               _CurrentProcess.setZ(_CPU.Zflag);
               _CurrentProcess.setIr(_CPU.IR);
               _CurrentProcess.setState(2); //set state to waiting
//               alert("state after: "+_CurrentProcess.getState());
               _ReadyQueue.enqueue(_CurrentProcess);//push back to ready queue
               _CurrentProcess.displayPCB();//update display
               _CPU.displayCPU();
           }

//           if (_CurrentProcess.getState() == "Terminated" && _ReadyQueue.getSize()> 0){
//               _CurrentProcess.displayPCB();
//               _CPU.displayCPU();
//               _KernelInterruptQueue.enqueue(new Interrupt(_Break,0));
//           }
       }
    }
}