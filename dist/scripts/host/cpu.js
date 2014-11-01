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
            if (typeof IR === "undefined") { IR = "?"; }
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
            _CPU.manageOpCodes(_MemoryManager.read(_CPU.PC));

            //Update the Memory if Any Changes!
            _MemoryManager.update();

            //Update the CPU Table
            _CPU.displayCPU();

            //Update PCB
            _CPU.updatePcb(_CurrentProcess);

            //Display the PCB
            _CurrentProcess.displayPCB();
        };

        Cpu.prototype.displayCPU = function () {
            document.getElementById("pc").innerHTML = this.PC.toString(); //Off by one IDK why!
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
                _CPU._A9_Instruction(str);
            } else if (str == "AD") {
                _CPU._AD_Instruction(str);
            } else if (str == "8D") {
                _CPU._8D_Instruction(str);
            } else if (str == "6D") {
                _CPU._6D_Instruction(str);
            } else if (str == "A2") {
                _CPU._A2_Instruction(str);
            } else if (str == "AE") {
                _CPU._AE_Instruction(str);
            } else if (str == "A0") {
                _CPU._A0_Instruction(str);
            } else if (str == "AC") {
                _CPU._AC_Instruction(str);
            } else if (str == "EA") {
                _CPU._EA_Instruction(str);
            } else if (str == "00") {
                _CPU._00_Instruction(str);
            } else if (str == "EC") {
                _CPU._EC_Instruction(str);
            } else if (str == "D0") {
                _CPU._D0_Instruction(str);
            } else if (str == "EE") {
                _CPU._EE_Instruction(str);
            } else if (str == "FF") {
                _CPU._FF_Instruction(str);
            } else {
                _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_InvalidOpCode, 0));
                _StdOut.putText("Instruction Not VALID!");
            }
            _CPU.PC++;
        };

        /**
        * Load the accumulator with a constant
        * Takes 1 parameter (Constant)
        */
        Cpu.prototype._A9_Instruction = function (str) {
            _CPU.IR = str;
            _CPU.PC++;
            _CPU.Acc = parseInt(_MemoryManager.read(_CPU.PC), 16);
            _CPU.INS = "CPU   [LDA #$" + _CPU.Acc.toString(16) + "]" + "   [" + _CPU.IR + ", " + _CPU.Acc.toString(16) + "]";
        };

        /**
        * Load the accumulator from the  Memory
        * Takes 2 parameters.
        */
        Cpu.prototype._AD_Instruction = function (str) {
            _CPU.IR = str;
            var address = this.loadTwoBytes();
            _CPU.Acc = (parseInt(_MemoryManager.read(address), 16)); //store in the Acc from memory
            _CPU.INS = "CPU   [LDA $00" + address.toString(16) + "]   " + "[" + _CPU.IR + ", " + address.toString(16) + ", 00]";
        };

        /**
        * Store the Accumulator in the memory.
        * @private
        */
        Cpu.prototype._8D_Instruction = function (str) {
            _CPU.IR = str;
            var address = this.loadTwoBytes();
            _MemoryManager.store(address, _CPU.Acc.toString(16)); //store in hex
            _CPU.INS = "CPU   [STA $00" + address.toString(16) + "]   " + "[" + _CPU.IR + ", " + address.toString(16) + ", 00]";
        };

        /**
        * Add the contents of Address to ACC and store it in ACC.
        * @private
        */
        Cpu.prototype._6D_Instruction = function (str) {
            _CPU.IR = str;
            var address = this.loadTwoBytes();
            var value = parseInt(_MemoryManager.read(address), 16);
            _CPU.Acc += value;
            _CPU.INS = "CPU   [ADC   $00" + address.toString(16) + "]" + "   [" + _CPU.IR + ", " + address.toString(16) + ", 00]";
        };

        /**
        * Load the X-Reg with Constant
        * @private
        */
        Cpu.prototype._A2_Instruction = function (str) {
            _CPU.IR = str;
            _CPU.PC++;
            var temp = _MemoryManager.read(_CPU.PC);
            _CPU.Xreg = parseInt(temp.toString(), 16); //store into x-reg as hex
            _CPU.INS = "CPU   [LDX   #$" + temp + "]" + "   [" + _CPU.IR + ", " + temp + "]";
        };

        /**
        * Load the X-Reg from Memory
        * @private
        */
        Cpu.prototype._AE_Instruction = function (str) {
            _CPU.IR = str;
            var address = this.loadTwoBytes();
            _CPU.Xreg = parseInt(_MemoryManager.read(address), 16);
            _CPU.INS = "CPU   [LDX   $00" + address.toString(16) + "]" + "   [" + _CPU.IR + ", " + address.toString(16) + ", 00]";
        };

        /**
        * Load the Y-Reg with Constant
        * @private
        */
        Cpu.prototype._A0_Instruction = function (str) {
            _CPU.IR = str;
            _CPU.PC++;
            var temp = _MemoryManager.read(_CPU.PC);
            _CPU.Yreg = parseInt(temp.toString(), 16); //store into y-reg as hex
            _CPU.INS = "CPU   [LDY   #$" + temp + "]" + "   [" + _CPU.IR + ", " + temp + "]";
        };

        /**
        * Load the Y_Reg from Memory
        * @private
        */
        Cpu.prototype._AC_Instruction = function (str) {
            _CPU.IR = str;
            var address = this.loadTwoBytes();
            _CPU.Yreg = parseInt(_MemoryManager.read(address), 16);
            _CPU.INS = "CPU   [LDY   $00" + address.toString(16) + "]" + "   [" + _CPU.IR + ", " + address.toString(16) + ", 00]";
        };

        /**
        * No Operation
        * @private
        */
        Cpu.prototype._EA_Instruction = function (str) {
            _CPU.INS = "CPU   [EA]"; //Ha Ha this was easy!
            return;
        };

        /**
        * Break
        * @private
        */
        Cpu.prototype._00_Instruction = function (str) {
            _CPU.IR = str;
            _CPU.INS = "CPU   [00]";
            var int = new TSOS.Interrupt(_Break, 0);
            _KernelInterruptQueue.enqueue(int);
        };

        /**
        * Compare a byte in Memory to the X-Reg
        * Set Z-Flag to if Equal
        * @private
        */
        Cpu.prototype._EC_Instruction = function (str) {
            _CPU.IR = str;
            var address = this.loadTwoBytes();
            var value = parseInt(_MemoryManager.read(address), 16);

            if (value == _CPU.Xreg) {
                _CPU.Zflag = 1;
            } else {
                _CPU.Zflag = 0;
            }

            _CPU.INS = "CPU   [EC   $00" + address.toString(16) + "]" + "   [" + _CPU.IR + ", " + address.toString(16) + ", 00]";
        };

        /**
        * Branch X bytes if Z-Flag Equals 0!
        * @private
        */
        Cpu.prototype._D0_Instruction = function (str) {
            _CPU.IR = str;

            if (_CPU.Zflag == 0) {
                var address = parseInt(_MemoryManager.read(++_CPU.PC), 16);
                _CPU.PC += address;

                if (_CPU.PC > (_CurrentProcess.getBase() + _BlockSize) - 1) {
                    alert("PC: " + _CPU.PC + ", Base: " + _CurrentProcess.getBase() + ", Block Size: " + _BlockSize);
                    _CPU.PC = _CPU.PC - (_CurrentProcess.getBase() + _BlockSize);
                }
                _CPU.INS = "CPU [D0 $EF]" + "   [" + _CPU.IR + ", " + address + "]";
            } else {
                _CPU.PC++;
                _CPU.INS = "CPU [D0 $EF]" + "   [" + _CPU.IR + ", " + address + "]";
            }
        };

        /**
        * Increment the value by a byte.
        * @private
        */
        Cpu.prototype._EE_Instruction = function (str) {
            _CPU.IR = str;
            var address = this.loadTwoBytes();
            var value = parseInt(_MemoryManager.read(address), 16);
            value++; // increment
            _MemoryManager.store(address, value.toString(16)); //store value at the address
            _CPU.INS = "CPU [EC $00" + address.toString(16) + "]" + "[   " + _CPU.IR + ", " + address.toString(16) + ", 00]";
        };

        /**
        * System Call!
        * @private
        */
        Cpu.prototype._FF_Instruction = function (str) {
            _CPU.IR = str;
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_SystemCall, _CPU.Xreg));
            _CPU.INS = "CPU [SYS]" + "   [" + _CPU.IR + "]";
        };

        Cpu.prototype.loadTwoBytes = function () {
            var first = parseInt(_MemoryManager.read(++_CPU.PC), 16);
            var second = parseInt(_MemoryManager.read(++_CPU.PC), 16);
            return parseInt((first + second));
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
