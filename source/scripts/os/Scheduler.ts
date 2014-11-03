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

       public setCurrentProcess(){

           if(_ReadyQueue.getSize() > 0) {
               _CurrentProcess = this.getNextProcess();
               _CurrentProcess.setState(1);//set state to "Running"
               _CPU.setCPU(_CurrentProcess);
               _CPU.isExecuting = true;
               _Kernel.krnTrace("PROCESSING PID: "+_CurrentProcess.getPid()+"\n");
           }
       }

       public contextSwitch(){

           this.reset();

           if(_CurrentProcess.getState() == "Terminated"){
               this.reset();
           }

           var newProcess = this.getNextProcess();

           if(newProcess == -1){
               this.reset();
               _CPU.reset();
               _CPU.isExecuting = false;
               _CPU.displayCPU();
           }else {
               this.performSwitch(_CurrentProcess);
               _CurrentProcess = newProcess;
               _Kernel.krnTrace("CONTEXT SWITCH TO PID: "+_CurrentProcess.getPid());
               _CurrentProcess.setState(1);
               _CPU.setCPU(_CurrentProcess);
               _CPU.isExecuting = true;
           }
       }

       public getNextProcess(){
           if(_ReadyQueue.getSize() > 0)
               return _ReadyQueue.dequeue();
           return -1;
       }

       public reset(){
           _ClockCycle = 0;
           _CurrentProcess.displayPCB();
           _CPU.displayCPU();
       }

       public performSwitch(process){

           if(process.getState() != "Terminated"){
               _CurrentProcess.setPc(_CPU.PC);
               process.setState(2); //set state to waiting
               _ReadyQueue.enqueue(process);//push back to ready queue
               process.displayPCB();//update display
           }

           if (process.getState() == "Terminated"){
               process.displayPCB();
               this.reset();
           }
       }
    }
}