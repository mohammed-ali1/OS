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
        function Cpu(PC, Acc, IR, INS, Xreg, Yreg, Zflag, isExecuting) {
            if (typeof PC === "undefined") { PC = 0; }
            if (typeof Acc === "undefined") { Acc = 0; }
            if (typeof IR === "undefined") { IR = ""; }
            if (typeof INS === "undefined") { INS = ""; }
            if (typeof Xreg === "undefined") { Xreg = 0; }
            if (typeof Yreg === "undefined") { Yreg = 0; }
            if (typeof Zflag === "undefined") { Zflag = 0; }
            if (typeof isExecuting === "undefined") { isExecuting = false; }
            this.PC = PC;
            this.Acc = Acc;
            this.IR = IR;
            this.INS = INS;
            this.Xreg = Xreg;
            this.Yreg = Yreg;
            this.Zflag = Zflag;
            this.isExecuting = isExecuting;
        }
        Cpu.prototype.init = function () {
            this.PC = 0;
            this.Acc = 0;
            this.IR = "";
            this.INS = "";
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
            _Memory.updateMemory();

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
            document.getElementById("instruction").innerHTML = _CPU.INS;
        };

        Cpu.prototype.manageOpCodes = function (str) {
            str = str.toString();

            if (str.toUpperCase() == "A9") {
                _CPU._A9_Instruction();
            } else if (str == "AD") {
                this._AD_Instruction();
            } else if (str == "8D") {
                _CPU._8D_Instruction();
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
                _CPU._00_Instruction();
            } else if (str == "EC") {
                this._EC_Instruction();
            } else if (str == "D0") {
                this._D0_Instruction();
            } else if (str == "EE") {
                this._EE_Instruction();
            } else if (str == "FF") {
                _CPU._FF_Instruction();
            } else if (str == "$$") {
                this._00_Instruction();
            } else {
                _StdOut.putText("Instruction Not VALID!");
            }
            _CPU.PC++;
        };

        /**
        * Load the accumulator with a constant
        * Takes 1 parameter (Constant)
        */
        Cpu.prototype._A9_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC].toString();
            _CPU.PC++;
            _CPU.Acc = parseInt(_MainMemory[_CPU.PC], 10); //read in base 10
            _CPU.INS = "CPU -> [LDA #$" + _CPU.Acc + "]";
        };

        /**
        * Load the accumulator from the  Memory
        * Takes 2 parameters.
        */
        Cpu.prototype._AD_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC].toString();
            _CPU.PC++;
            _CPU.Acc = parseInt(_MainMemory[_CPU.PC]);
            _CPU++;
            _CPU.INS = "CPU -> [LDA $00" + _CPU.Acc + "]";
        };

        /**
        * Store the Accumulator in the memory.
        * @private
        */
        Cpu.prototype._8D_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC].toString();
            _CPU.PC++;
            var temp = parseInt(_MainMemory[_CPU.PC], 16);
            _MainMemory[temp] = "" + _CPU.Acc;
            _CPU.PC++;
            _CPU.INS = "CPU -> [STA $00" + temp.toString(16) + "]";
        };

        /**
        * Add the contents of Address and store it in ACC.
        * @private
        */
        Cpu.prototype._6D_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC];
            _CPU.PC++;
            var temp = parseInt(_MainMemory[_CPU.PC], 16);
            _CPU.Acc += parseInt(_MainMemory[temp], 10);
            _CPU.PC++;
        };

        /**
        * Load the X-Reg with Constant
        * @private
        */
        Cpu.prototype._A2_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC];
            _CPU.PC++;
            _CPU.Xreg = parseInt(_MainMemory[_CPU.PC], 10);
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
            _CPU.IR = _MainMemory[_CPU.PC];
            _CPU.PC++;
            _CPU.Yreg = parseInt(_MainMemory[_CPU.PC], 10);
        };

        /**
        * Load the Y_Reg from Memory
        * @private
        */
        Cpu.prototype._AC_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC];
            _CPU.PC++;
            var temp = parseInt(_MainMemory[_CPU.PC], 16);
            _CPU.Yreg = parseInt(_MainMemory[temp], 10);
            _CPU.PC++;
        };

        /**
        * No Operation
        * @private
        */
        Cpu.prototype._EA_Instruction = function () {
            return;
        };

        /**
        * Break
        * @private
        */
        Cpu.prototype._00_Instruction = function () {
            var int = new TSOS.Interrupt(-1, 0);
            _KernelInterruptQueue.enqueue(int);
        };

        /**
        * Compare a byte in Memory to the X-Reg
        * Set Z-Flag to "0" if Equal
        * @private
        */
        Cpu.prototype._EC_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC];
            _CPU.PC++;
            var temp = parseInt(_MainMemory[_CPU.PC], 10);
            if (_CPU.Zflag == temp) {
                _CPU.Zflag = 0;
            }
            _CPU.PC++;
        };

        /**
        * Branch X bytes if Z-Flag Equals 0!
        * @private
        */
        Cpu.prototype._D0_Instruction = function () {
            _CPU.IR = _MainMemory[_CPU.PC];

            if (_CPU.Zflag == 0) {
                _CPU.PC++;
                var temp = parseInt(_MainMemory[_CPU.PC], 10);
                _CPU.PC = temp - _CPU.PC;
            }
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
            _CPU.IR = _MainMemory[_CPU.PC];
            var temp = _CPU.Yreg;
            _StdOut.putText("Y-Reg: " + temp);
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
