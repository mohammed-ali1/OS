/**
 * Created by anwar on 10/4/14.
 */

module TSOS{

    export class Pcb{

        public static PID: number = -1;    //Start at -1 so we can start incrementing from 0!
        public pid:number = Pcb.PID;
        public pc:number = 0;
        public acc:number = 0;
        public ir:string = "";
        public x:number = 0;
        public y:number = 0;
        public z:number = 0;
        public base: number = 0;
        public limit:number = 0;
        public state:string = "?";
        public length:number = 0; //Length of the program
        public block : number = 0;
        public inMemory:boolean = false;
        public block:number = 0;

        constructor(b:number, l:number, location:boolean){

            Pcb.PID++;
            this.pid = Pcb.PID;  //Increment PID all the time!
            this.base = b;
            this.pc = 0;
            this.limit = l;
            this.block = (this.base / _BlockSize);
            if(location == true)
                this.inMemory = true;
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
            return this.pid;  //return the loc al data member (NON - STATIC)
        }

        public setLength(length:number){
            this.length = length;
        }

        public setState(s:number){

            switch (s){
                case 1:
                    this.state = "Running";
                    break;
                case 2:
                    this.state = "Waiting";
                    break;
                case 3:
                    this.state = "Ready";
                    break;
                case 4:
                    this.state = "Terminated";
                    break;
                case 5:
                    this.state = "Killed";
                    break;
                default :
                    this.state = "New";
            }
        }

        public getState(){
            return this.state;
        }

        public getLimit(){
            return this.limit;
        }

        public getBase(){
            return this.base;
        }

        public getLength(){
            return this.length;
        }

        public getX(){
            return this.x;
        }

        public getY(){
            return this.y;
        }

        public getZ(){
            return this.z;
        }

        public getIR(){
            return this.ir;
        }

        public getAcc(){
            return this.acc;
        }

        public getBlock(){
            return this.block;
        }

        public getPc(){
            return this.pc;
        }

        public setPc(pc:number){
            this.pc = pc;
        }

        public setX(x:number){
            this.x = x;
        }

        public setY(y:number){
            this.y = y;
        }

        public setZ(z:number){
            this.z = z;
        }

        public setAcc(acc:number){
            this.acc = acc;
        }

        public setIr(ir:string){
            this.ir = ir;
        }

        public getBlock(){
            return this.block;
        }


        public inMemory(){
            if(this.inMemory)
                return "True";
            else
                return "False";
        }
    }
}