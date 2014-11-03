/**
 * Created by anwar on 11/2/14.
 */
module TSOS{

   export class Scheduler{

       public scheduler : string[] = ["RR", "FCFS","Priority"];
       public timer;
       public switch:boolean = false;
       public current = "";

        constructor(){
            alert("Constructor Called");
            this.current = this.scheduler[0].toString();
            this.timer = 0;
            this.switch = false;
            this.RR();
        }

        public needContextSwitch(){

            if((_CurrentProcess.getState() == "Terminated")&& (this.timer == _Quantum)) {
                this.timer = 0;
                this.switch = true;
            }

            if(this.timer == _Quantum && _CurrentProcess.getState() == "Running"){
                _CurrentProcess.setState(2);    //Save the state of the Process
                this.switch = true;//set context switch to true
                this.timer = 0;
            }

            if(this.timer < _Quantum){
                this.switch = false;
            }

            alert("Timer is: "+this.timer.toString()+", Switch is: "+this.switch.toString()+", Process: "+_CurrentProcess.getPid());
        }

        public RR(){

            alert("RR Called");

            while(this.timer != _Quantum){

                this.timer++;
                alert("Timer is: "+this.timer);
                this.needContextSwitch();

                if(this.switch){
                    _ReadyQueue.enqueue(_CurrentProcess);
                }else{ // no context switching...just get the next process off of the Ready Queue....?

                    for(var i=0; i<_ResidentQueue.length;i++){
                        if(_ResidentQueue[i].getState() == "New"){
                            _ReadyQueue.enqueue(_ResidentQueue[i]); //Get the next new process
                            break;
                        }
                    }
                }
            }

        }


       public schedulerExe(p:TSOS.Pcb){

           _CurrentProcess = p;
           _Kernel.krnTrace("Processing PID: " +  _CurrentProcess.getPid());
           _StdOut.putText("Processing PID: "+_CurrentProcess.getPid());
           _Console.advanceLine();
           _OsShell.putPrompt();
           _CPU.isExecuting = true;
           _CPU.PC = _CurrentProcess.getBase();
           _CPU.displayCPU();
           _CurrentProcess.setState(1); //set state "Running"
           Shell.updateResident();
        }
    }
}