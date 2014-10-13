/**
 * Created by anwar on 10/4/14.
 */

module TSOS{

    export class Pcb{

        private static PID : number = -1;   //Start at -1 so we can start incrementing from 0!
        public pc:number = 0;
        public acc:number = 0;
        public ir:string = "";
        public x:number = 0;
        public y:number = 0;
        public z:number = 0;
        public base: number = 0;
        public limit:number = 0;
        public state:string = "NEW";

        constructor(b:number, l:number){

            Pcb.PID++;  //Increment PID all the time!
            this.base = b;
            this.limit = parseInt(l.toString(16));

        }

        /**
         * Displays the the status of the current PCB.
         */
        public displayPCB(){

            document.getElementById("pcbPid").innerHTML = "" + this.getPid();
            document.getElementById("pcbBase").innerHTML = "" + this.base;
            document.getElementById("pcbLimit").innerHTML =  "" + this.limit;
            document.getElementById("pcbStatus").innerHTML = this.state.toString();

            document.getElementById("pcbPc").innerHTML = "" + this.pc;
            document.getElementById("pcbAcc").innerHTML = "" + this.acc;
            document.getElementById("pcbIr").innerHTML = this.ir;
            document.getElementById("pcbX").innerHTML = "" + this.x;
            document.getElementById("pcbY").innerHTML = "" + this.y;
            document.getElementById("pcbZ").innerHTML = "" + this.z;
        }

        public getPid() : number{
            return Pcb.PID;
        }

        public setState(s:number){

            switch (s){
                case 0:
                    _Pcb.state = "NEW";
                    break;
                case 1:
                    _Pcb.state = "Running";
                    break;
                case 2:
                    _Pcb.state = "Terminated";
                    break;
                default :
                    _Pcb.state = "???";

            }
        }
    }
}