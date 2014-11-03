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
           }
       }

        public needContextSwitch():boolean{
            return _ClockCycle >= _Quantum;
        }

       public contextSwitch(){

           var newProcess = this.getNextProcess();

          if(newProcess != null || newProcess != undefined){

              this.performSwitch(newProcess);

              _CurrentProcess = newProcess;
              _CurrentProcess.setState(1);
              _CPU.setCPU(_CurrentProcess);
          }else if(_CurrentProcess.getState() == "Terminated"){
              this.reset();
          }
       }

       public getNextProcess(){
           if(_ReadyQueue.getSize() > 0)
               return _ReadyQueue.dequeue();
       }

       public reset(){
           _ClockCycle = 0;
           _CPU.isExecuting = false;
           _CurrentProcess.displayPCB();
           _CurrentProcess = null;
       }

       public performSwitch(process){

           if(process.getState() != "Terminated"){
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