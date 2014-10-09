///<reference path="../globals.ts" />

/* ------------
     CPU.ts

     Requires global.ts.

     Routines for the host CPU simulation, NOT for the OS itself.
     In this manner, it's A LITTLE BIT like a hypervisor,
     in that the Document environment inside a browser is the "bare metal" (so to speak) for which we write code
     that hosts our client OS. But that analogy only goes so far, and the lines are blurred, because we are using
     TypeScript/JavaScript in both the host and client environments.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Cpu {

        constructor(public PC: number = 0,
                    public Acc: number = 0,
                    public IR: string = "",
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 1;
            this.Acc = 0;
            this.IR = "";
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        }
        
        public cycle(): void {
            _Kernel.krnTrace('CPU cycle');
            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.

            //Read Stuff from Memory @ Program Counter
            this.manageOpCodes(_MainMemory[_CPU.PC]);

            //Update the Memory if Any Changes!
            _Memory.updateMemory();

            //Update the CPU Table
            this.displayCPU();

            //Update PCB
            this.updatePcb(_Pcb.getPid()-1);

            //Display the PCB
            (_Pcb.getPid()-1).displayPCB();
        }

        public displayCPU(){

            document.getElementById("pc").innerHTML = _CPU.PC.toString();
            document.getElementById("acc").innerHTML = _CPU.Acc.toString();
            document.getElementById("ir").innerHTML = _CPU.IR.toString();
            document.getElementById("x").innerHTML = _CPU.Xreg.toString();
            document.getElementById("y").innerHTML = _CPU.Yreg.toString();
            document.getElementById("z").innerHTML = _CPU.Zflag.toString();
            document.getElementById("s").innerHTML = _CPU.isExecuting.toString();
        }

        public manageOpCodes(str){

            str = str.toString();

            if(str.toUpperCase() == "A9"){
                this._A9_Instruction();
            }
            else if(str == "AD"){
                this._AD_Instruction();
            }
            else if(str == "8D"){
                this._8D_Instruction();
            }
            else if(str == "6D"){
                this._6D_Instruction();
            }
            else if(str == "A2"){
                this._A2_Instruction();
            }
            else if(str == "AE"){
                this._AE_Instruction();
            }
            else if(str == "A0"){
                this._A0_Instruction();
            }
            else if(str == "AC"){
                this._AC_Instruction();
            }
            else if(str == "EA"){
                this._EA_Instruction();
            }
            else if(str == "00"){
                this._00_Instruction();
            }
            else if(str == "EC"){
                this._EC_Instruction();
            }
            else if(str == "D0"){
                this._D0_Instruction();
            }
            else if(str == "EE"){
                this._EE_Instruction();
            }
            else if(str == "FF"){
                this._FF_Instruction();
            }
            else{
                _StdOut.putText("Instruction Not VALID!");
            }
            this.PC++;
        }

        /**
         * Load the accumulator with a constant
         * Takes 1 parameter.
         */
        public _A9_Instruction(){

            this.IR = _MainMemory[this.PC];
            this.Acc = parseInt(_MainMemory[++this.PC],10); //read in base 10
        }

        /**
         * Load the accumulator from the  Memory
         * Takes 2 parameters.
         */
        public _AD_Instruction(){
            this.Acc = parseInt(_MainMemory[++this.PC]);
        }

        /**
         * Store the Accumulator in the memory.
         * @private
         */
        public _8D_Instruction(){
            _MainMemory[(this.PC+1).toString(16)] = this.PC+1;
        }

        /**
         * Add the contents of Address and store it in ACC.
         * @private
         */
        public _6D_Instruction(){
            this.Acc += parseInt(_MainMemory[this.PC+1]);
        }

        /**
         * Load the X-Reg with Constant
         * @private
         */
        public _A2_Instruction(){
            this.Xreg = parseInt(_MainMemory[this.PC+1]);
        }

        /**
         * Load the X-Reg from Memory
         * @private
         */
        public _AE_Instruction(){
            this.Xreg = parseInt(_MainMemory[_MainMemory[this.PC+1]]);
        }

        /**
         * Load the Y-Reg with Constant
         * @private
         */
        public _A0_Instruction(){
            this.Yreg = parseInt(_MainMemory[this.PC+1]);
        }

        /**
         * Load the Y_Reg from Memory
         * @private
         */
        public _AC_Instruction(){
            this.Yreg = parseInt(_MainMemory[_MainMemory[this.PC+1]]);
        }

        /**
         * No Operation
         * @private
         */
        public _EA_Instruction(){

        }

        /**
         * Break
         * @private
         */
        public _00_Instruction(){

        }

        /**
         * Compare a byte in Memory to the X-Reg
         * Set Z-Flag to "0" if Equal
         * @private
         */
        public _EC_Instruction(){
            if(this.Zflag == _MainMemory[this.PC+1]){
                this.Zflag = 0;
            }
        }

        /**
         * Branch X bytes if Z-Flag Equals 0!
         * @private
         */
        public _D0_Instruction(){

        }

        /**
         * Increment the value by a byte.
         * @private
         */
        public _EE_Instruction(){

        }

        /**
         * System Call!
         * @private
         */
        public _FF_Instruction(){

        }

        public updatePcb(p:Pcb){

            _Pcb.pc = this.PC;
            _Pcb.acc = this.Acc;
            _Pcb.ir = this.IR;
            _Pcb.x = this.Xreg;
            _Pcb.y = this.Yreg;
            _Pcb.z = this.Zflag;
        }
    }
}