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
        function Cpu(PC, Acc, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 1;
            this.Acc = 0;
            this.Xreg = 0;
            this.Yreg = 0;
            this.Zflag = 0;
            this.isExecuting = false;
        };

        Cpu.prototype.cycle = function () {
            _Kernel.krnTrace('CPU cycle');

            // TODO: Accumulate CPU usage and profiling statistics here.
            // Do the real work here. Be sure to set this.isExecuting appropriately.
            //Read Stuff from Memory
            this.manageOpCodes(_MainMemory[this.PC]);

            //Update the Memory if Any Changes!
            TSOS.Memory.updateMemory();

            //Update the Current State of CPU!
            this.displayCPU();
        };

        Cpu.prototype.displayCPU = function () {
            document.getElementById("pc").innerHTML = _CPU.PC.toString();
            document.getElementById("acc").innerHTML = _CPU.Acc.toString();
            document.getElementById("x").innerHTML = _CPU.Xreg.toString();
            document.getElementById("y").innerHTML = _CPU.Yreg.toString();
            document.getElementById("z").innerHTML = _CPU.Zflag.toString();
            document.getElementById("s").innerHTML = _CPU.isExecuting.toString();
        };

        Cpu.prototype.manageOpCodes = function (str) {
            str = str.toString();

            if (str == "A9") {
                this._A9_Instruction();
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
        };

        /**
        * Load the accumulator with a constant
        */
        Cpu.prototype._A9_Instruction = function () {
            this.Acc = _MainMemory[this.PC + 1];
        };

        Cpu.prototype._AD_Instruction = function () {
            this.Acc = _MainMemory[_MainMemory[this.PC + 1]];
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
            this.Acc += parseInt(_MainMemory[this.PC + 1].toString(16));
        };

        /**
        * Load the X-Reg with Constant
        * @private
        */
        Cpu.prototype._A2_Instruction = function () {
            this.Xreg = _MainMemory[this.PC + 1];
        };

        /**
        * Load the X-Reg from Memory
        * @private
        */
        Cpu.prototype._AE_Instruction = function () {
            this.Xreg = _MainMemory[_MainMemory[this.PC + 1]].toString(16);
        };

        /**
        * Load the Y-Reg with Constant
        * @private
        */
        Cpu.prototype._A0_Instruction = function () {
            this.Yreg = _MainMemory[this.PC + 1];
        };

        /**
        * Load the Y_Reg from Memory
        * @private
        */
        Cpu.prototype._AC_Instruction = function () {
            this.Yreg = _MainMemory[_MainMemory[this.PC + 1]].toString(16);
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
        return Cpu;
    })();
    TSOS.Cpu = Cpu;
})(TSOS || (TSOS = {}));
