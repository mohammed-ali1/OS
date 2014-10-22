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
                    public INS: string = "",
                    public Xreg: number = 0,
                    public Yreg: number = 0,
                    public Zflag: number = 0,
                    public isExecuting: boolean = false) {

        }

        public init(): void {
            this.PC = 0;
            this.Acc = 0;
            this.IR = "";
            this.INS = "";
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
            _CPU.manageOpCodes(_MemoryManager.read(_CPU.PC));

            //Update the Memory if Any Changes!
            _MemoryManager.update();

            //Update the CPU Table
            _CPU.displayCPU();

            //Update PCB
            _CPU.updatePcb(_Pcb);

            //Display the PCB
            _Pcb.displayPCB();
        }

        public displayCPU(){

            document.getElementById("pc").innerHTML = this.PC.toString(); //Off by one IDK why!
            document.getElementById("acc").innerHTML = this.Acc.toString();
            document.getElementById("ir").innerHTML = this.IR;
            document.getElementById("x").innerHTML = this.Xreg.toString();
            document.getElementById("y").innerHTML = this.Yreg.toString();
            document.getElementById("z").innerHTML = this.Zflag.toString();
            document.getElementById("instruction").innerHTML = _CPU.INS;
        }

        public manageOpCodes(str){

            str = str.toString();

            if(str.toUpperCase() == "A9"){
                _CPU._A9_Instruction(str);
            }
            else if(str == "AD"){
                _CPU._AD_Instruction(str);
            }
            else if(str == "8D"){
                _CPU._8D_Instruction(str);
            }
            else if(str == "6D"){
                _CPU._6D_Instruction(str);
            }
            else if(str == "A2"){
                _CPU._A2_Instruction(str);
            }
            else if(str == "AE"){
                _CPU._AE_Instruction(str);
            }
            else if(str == "A0"){
                _CPU._A0_Instruction(str);
            }
            else if(str == "AC"){
                _CPU._AC_Instruction(str);
            }
            else if(str == "EA"){
                _CPU._EA_Instruction(str);
            }
            else if(str == "00"){
                _CPU._00_Instruction(str);
            }
            else if(str == "EC"){
                _CPU._EC_Instruction(str);
            }
            else if(str == "D0"){
                _CPU._D0_Instruction(str);
            }
            else if(str == "EE"){
                _CPU._EE_Instruction(str);
            }
            else if(str == "FF"){
                _CPU._FF_Instruction(str);
            }
            else{
                _StdOut.putText("Instruction Not VALID!");
            }
            _CPU.PC++;
        }

        /**
         * Load the accumulator with a constant
         * Takes 1 parameter (Constant)
         */
        public _A9_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            _CPU.Acc = parseInt(_MemoryManager.read(_CPU.PC),16);
            _CPU.INS = "CPU   [LDA #$" + _CPU.Acc.toString(16) + "]" +
                "   ["+_CPU.IR+", "+_CPU.Acc.toString(16)+"]";
        }

        /**
         * Load the accumulator from the  Memory
         * Takes 2 parameters.
         */
        public _AD_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var address  = parseInt(_MemoryManager.read(_CPU.PC),16)  //Get the address first in hex
            var value =  parseInt(_MemoryManager.read(address)); // Get the contents of the address
            _CPU.Acc =     parseInt(value.toString(),16); //Store Acc with the contents in hex
            _CPU.PC++;
            _CPU.INS = "CPU   [LDA $00" + address + "]   " +
                "[" +_CPU.IR+", "+address+", 00]";
        }

        /**
         * Store the Accumulator in the memory.
         * @private
         */
        public _8D_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var temp = _CPU.Acc;  //Get the current Acc
            var address = parseInt(_MemoryManager.read(_CPU.PC),16); //Get the address in hex
            _MemoryManager.store(address,temp.toString(16)); //Store it in hex
            _CPU.PC++;
            _CPU.INS = "CPU   [STA $00" +address.toString(16) + "]   " +
                "["+_CPU.IR+", "+address.toString(16)+", 00]";
        }

        /**
         * Add the contents of Address to ACC and store it in ACC.
         * @private
         */
        public _6D_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;

            var address = parseInt(_MemoryManager.read(_CPU.PC),16);//Get the address in hex
            var value = parseInt(_MemoryManager.read(address)); //Get the contents of the address
            var currentAcc  = parseInt(_CPU.Acc.toString(16),10); //Get the current ACC in decimal
            _CPU.Acc = parseInt(value+currentAcc,16);// Add everything to the Acc

            _CPU.INS = "CPU   [ADC   $00" + _MemoryManager.read(_CPU.PC) + "]" +
                "   ["+_CPU.IR+", "+ address+", 00]";
            _CPU.PC++;
        }

        /**
         * Load the X-Reg with Constant
         * @private
         */
        public _A2_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var temp = _MemoryManager.read(_CPU.PC); //Get the value first
            _CPU.Xreg = parseInt(temp.toString(),16);//store into x-reg as hex
            _CPU.INS = "CPU   [LDX   #$" + _MemoryManager.read(_CPU.PC) + "]" +
                "   ["+_CPU.IR+", "+temp+"]";
        }

        /**
         * Load the X-Reg from Memory
         * @private
         */
        public _AE_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var address = parseInt(_MemoryManager.read(_CPU.PC),16); //get the address in hex
            var temp = parseInt(_MemoryManager.read(address)); //get the contents of the address
            _CPU.Xreg = parseInt(temp.toString(),16); // store it as hex in x-reg
            _CPU.INS = "CPU   [LDX   $00" + _MemoryManager.read(_CPU.PC) + "]" +
                "   ["+_CPU.IR+", "+address.toString(16)+", 00]";
            _CPU.PC++;
        }

        /**
         * Load the Y-Reg with Constant
         * @private
         */
        public _A0_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var temp = _MemoryManager.read(_CPU.PC); //get the value first
            _CPU.Yreg = parseInt(temp.toString(),16); //store into y-reg as hex
            _CPU.INS = "CPU   [LDY   #$" + _MemoryManager.read(_CPU.PC) + "]" +
                "   ["+_CPU.IR+", "+temp+"]";
        }

        /**
         * Load the Y_Reg from Memory
         * @private
         */
        public _AC_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var address = parseInt(_MemoryManager.read(_CPU.PC),16);//get the address in hex
            var temp = parseInt(_MemoryManager.read(address)); //get the contents of the address
            _CPU.Yreg = parseInt(temp.toString(),16); // store it as hex in y-reg
            _CPU.INS = "CPU   [LDY   $00" + _MemoryManager.read(_CPU.PC) + "]" +
                "   ["+_CPU.IR+", "+address.toString(16)+", 00]";
            _CPU.PC++;
        }

        /**
         * No Operation
         * @private
         */
        public _EA_Instruction(str:string){
            _CPU.INS = "CPU   [EA]";  //Ha Ha this was easy!
            return;
        }

        /**
         * Break
         * @private
         */
        public _00_Instruction(str:string){

            _CPU.IR = str;
            _CPU.INS = "CPU   [00]";
            var int = new Interrupt(_Break,0);  //Pass -1 to re-start CPU.
            _KernelInterruptQueue.enqueue(int);
        }

        /**
         * Compare a byte in Memory to the X-Reg
         * Set Z-Flag to if Equal
         * @private
         */
        public _EC_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC++;
            var address = parseInt(_MemoryManager.read(_CPU.PC),16); //get the address in hex.
            var value = _MemoryManager.read(address); // get the contents of the address.

            if(value == _CPU.Xreg){
                _CPU.Zflag = 1;
            }else{
                _CPU.Zflag = 0;
            }

            _CPU.INS = "CPU   [EC   $00" + address.toString(16) + "]" +
                "   ["+_CPU.IR+ ", "+address.toString(16)+", 00]";
            _CPU.PC++;
        }

        /**
         * Branch X bytes if Z-Flag Equals 0!
         * @private
         */
        public _D0_Instruction(str:string){

            _CPU.IR = str;

            if(_CPU.Zflag == 0){
                _CPU.PC++;
                var address:number = parseInt(_MemoryManager.read(_CPU.PC),16);
                _CPU.PC += address;
                var size = _MemoryManager.size();

                if(_CPU.PC > size){
                    _CPU.PC = _CPU.PC - size;
                }
                _CPU.INS = "CPU [D0 $EF]" +
                    "   ["+_CPU.IR+", "+address+"]";
            }
            else{
                _CPU.PC++;
                _CPU.INS = "CPU [D0 $EF]" +
                    "   ["+_CPU.IR+", "+address+"]";
            }
        }

        /**
         * Increment the value by a byte.
         * @private
         */
        public _EE_Instruction(str:string){
            _CPU.IR = str;
            _CPU.PC++;
            var address = parseInt(_MemoryManager.read(_CPU.PC),16); //get the address in hex
            var value = _MemoryManager.read(address); //get the address contents
            value++; // increment
            var store = parseInt(value.toString(),16);
            _MemoryManager.store(address,store.toString()); //store value at the address
            _CPU.PC++;
            _CPU.INS = "CPU [EC $00" + address.toString(16)+"]" +
                "[   "+_CPU.IR+", "+address.toString(16)+", 00]";
        }

        /**
         * System Call!
         * @private
         */
        public _FF_Instruction(str:string){

            _CPU.IR = str;
            _CPU.PC += 2;
            var temp = _CPU.Xreg;

            _KernelInterruptQueue.enqueue(new Interrupt(_SystemCall,0));

            _CPU.INS = "CPU [SYS]" +
                "   ["+_CPU.IR+"]";
        }

        public updatePcb(p:Pcb){

            p.pc = _CPU.PC;
            p.acc = _CPU.Acc;
            p.ir = _CPU.IR;
            p.x = _CPU.Xreg;
            p.y = _CPU.Yreg;
            p.z = _CPU.Zflag;
            if(_CPU.isExecuting)
                p.setState(1)
            else
                p.setState(2);
        }
    }
}