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
var TSOS;
(function (TSOS) {
    var Cpu = (function () {
        function Cpu(PC, Acc, IR, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 1; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof IR === "undefined") { IR = ""; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 1;
            this.Acc = 0;
            this.IR = "";
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            //Read Stuff from Memory @ Program Counter
            _CPU.manageOpCodes(_MainMemory[_CPU.PC].toString());

            //Update the Memory if Any Changes!
            //            _Memory.updateMemory();
            //
            //Update the CPU Table
            _CPU.displayCPU();

            //Update PCB
            _CPU.updatePcb(_Pcb);

            //Display the PCB
            _Pcb.displayPCB();
        };

        Cpu.prototype.displayCPU = function () {
            document.getElementById("pc").innerHTML = this.PC.toString();
            document.getElementById("acc").innerHTML = this.Acc.toString();
            document.getElementById("ir").innerHTML = this.IR;
            document.getElementById("x").innerHTML = this.Xreg.toString();
            document.getElementById("y").innerHTML = this.Yreg.toString();
            document.getElementById("z").innerHTML = this.Zflag.toString();
        };

        Cpu.prototype.manageOpCodes = function (str) {
            str = str.toString();

            if (str.toUpperCase() == "A9") {
                _CPU._A9_Instruction();
            } else if (str == "AD") {
                this._AD_Instruction();
            } else if (str == "8D") {
                this._8D_Instruction();
            } else if (str == "6D") {
                this._6D_Instruction();
            } else if (str == "A2") {
                this._A2_Instruction();
            } else if (str == "AE") {
                this._AE_Instruction();
            } else if (str == "A0") {
                this._A0_Instruction();
            } else if (str == "AC") {
                this._AC_Instruction();
            } else if (str == "EA") {
                this._EA_Instruction();
            } else if (str == "00") {
                this._00_Instruction();
            } else if (str == "EC") {
                this._EC_Instruction();
            } else if (str == "D0") {
                this._D0_Instruction();
            } else if (str == "EE") {
                this._EE_Instruction();
            } else if (str == "FF") {
                this._FF_Instruction();
            } else {
                _StdOut.putText("Instruction Not VALID!");
            }
            _CPU.PC++;
        };

        /**
        * Load the accumulator with a constant
        * Takes 1 parameter.
        */
        Cpu.prototype._A9_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC.toString()];
            _CPU.PC++;
            if (_CPU.PC % 8 == 0) {
                _CPU.PC++;
            }
            _CPU.Acc = parseInt(_MainMemory[_CPU.PC].toString()); //read in base 10
        };

        /**
        * Load the accumulator from the  Memory
        * Takes 2 parameters.
        */
        Cpu.prototype._AD_Instruction = function () {
            this.Acc = parseInt(_MainMemory[++this.PC]);
        };

        /**
        * Store the Accumulator in the memory.
        * @private
        */
        Cpu.prototype._8D_Instruction = function () {
            _MainMemory[(this.PC + 1).toString(16)] = this.PC + 1;
        };

        /**
        * Add the contents of Address and store it in ACC.
        * @private
        */
        Cpu.prototype._6D_Instruction = function () {
            this.Acc += parseInt(_MainMemory[this.PC + 1]);
        };

        /**
        * Load the X-Reg with Constant
        * @private
        */
        Cpu.prototype._A2_Instruction = function () {
            this.Xreg = parseInt(_MainMemory[this.PC + 1]);
        };

        /**
        * Load the X-Reg from Memory
        * @private
        */
        Cpu.prototype._AE_Instruction = function () {
            this.Xreg = parseInt(_MainMemory[_MainMemory[this.PC + 1]]);
        };

        /**
        * Load the Y-Reg with Constant
        * @private
        */
        Cpu.prototype._A0_Instruction = function () {
            this.Yreg = parseInt(_MainMemory[this.PC + 1]);
        };

        /**
        * Load the Y_Reg from Memory
        * @private
        */
        Cpu.prototype._AC_Instruction = function () {
            this.Yreg = parseInt(_MainMemory[_MainMemory[this.PC + 1]]);
        };

        /**
        * No Operation
        * @private
        */
        Cpu.prototype._EA_Instruction = function () {
        };

        /**
        * Break
        * @private
        */
        Cpu.prototype._00_Instruction = function () {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(0, 0));
        };

        /**
        * Compare a byte in Memory to the X-Reg
        * Set Z-Flag to "0" if Equal
        * @private
        */
        Cpu.prototype._EC_Instruction = function () {
            if (this.Zflag == _MainMemory[this.PC + 1]) {
                this.Zflag = 0;
            }
        };

        /**
        * Branch X bytes if Z-Flag Equals 0!
        * @private
        */
        Cpu.prototype._D0_Instruction = function () {
        };

        /**
        * Increment the value by a byte.
        * @private
        */
        Cpu.prototype._EE_Instruction = function () {
        };

        /**
        * System Call!
        * @private
        */
        Cpu.prototype._FF_Instruction = function () {
        };

        Cpu.prototype.updatePcb = function (p) {
            p.pc = _CPU.PC;
            p.acc = _CPU.Acc;
            p.ir = _CPU.IR;
            p.x = _CPU.Xreg;
            p.y = _CPU.Yreg;
            p.z = _CPU.Zflag;
        };
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
