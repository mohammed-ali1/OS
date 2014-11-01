/**
* Created by anwar on 10/4/14.
*/
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(b, l, location) {
            this.pid = Pcb.PID;
            this.pc = 0;
            this.acc = 0;
            this.ir = "";
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.base = 0;
            this.limit = 0;
            this.state = "?";
            this.length = 0;
            this.block = 0;
            this.inMemory = false;
            Pcb.PID++;
            this.pid = Pcb.PID; //Increment PID all the time!
            this.base = b;
            this.limit = l;
            if (location == true)
                this.inMemory = true;
        }
        /**
        * Displays the the status of the current PCB.
        */
        Pcb.prototype.displayPCB = function () {
            document.getElementById("pcbPid").innerHTML = "" + this.getPid();
            document.getElementById("pcbBase").innerHTML = "" + this.base;
            document.getElementById("pcbLimit").innerHTML = "" + this.limit;
            document.getElementById("pcbStatus").innerHTML = this.state.toString();
            document.getElementById("pcbPc").innerHTML = "" + this.pc;
            document.getElementById("pcbAcc").innerHTML = "" + this.acc;
            document.getElementById("pcbIr").innerHTML = this.ir;
            document.getElementById("pcbX").innerHTML = "" + this.x;
            document.getElementById("pcbY").innerHTML = "" + this.y;
            document.getElementById("pcbZ").innerHTML = "" + this.z;
        };

        Pcb.prototype.getPid = function () {
            return this.pid;
        };

        Pcb.prototype.setLength = function (length) {
            this.length = length;
        };

        Pcb.prototype.setState = function (s) {
            switch (s) {
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
                default:
                    this.state = "New";
            }
        };

        Pcb.prototype.getState = function () {
            return this.state;
        };

        Pcb.prototype.getLimit = function () {
            return this.limit;
        };

        Pcb.prototype.getBase = function () {
            return this.base;
        };

        Pcb.prototype.getLength = function () {
            return this.length;
        };

        Pcb.prototype.inMemory = function () {
            if (this.inMemory)
                return "True";
            else
                return "False";
        };
        Pcb.PID = -1;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
