/**
* Created by anwar on 10/4/14.
*/
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(b, l) {
            this.pc = 0;
            this.acc = 0;
            this.ir = "";
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.base = 0;
            this.limit = 0;
            this.state = "NEW";
            Pcb.PID++; //Increment PID all the time!
            this.base = b;
            this.limit = l;
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
            return Pcb.PID;
        };

        Pcb.prototype.setState = function (s) {
            switch (s) {
                case 0:
                    _Pcb.state = "NEW";
                    break;
                case 1:
                    _Pcb.state = "Running";
                    break;
                case 2:
                    _Pcb.state = "Terminated";
                    break;
                default:
                    _Pcb.state = "???";
            }
        };
        Pcb.PID = -1;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
