/**
* Created by anwar on 10/4/14.
*/
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(b, l) {
            this.pid = Pcb.PID;
            this.pc = 0;
            this.acc = 0;
            this.ir = "";
            this.x = 0;
            this.y = 0;
            this.z = 0;
            this.base = 0;
            this.limit = "0";
            this.state = "?";
            this.length = 0;
            this.inuse = false;
            Pcb.PID++;
            this.pid = Pcb.PID; //Increment PID all the time!
            this.base = b;
            this.limit = l.toString(16).toUpperCase();
            this.inuse = true;
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
                case 0:
                    this.state = "NEW";
                    break;
                case 1:
                    this.state = "Running";
                    break;
                case 2:
                    this.state = "Terminated";
                    break;
                default:
                    this.state = "???";
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

        Pcb.prototype.blockFree = function () {
            return this.inuse;
        };

        Pcb.prototype.getLength = function () {
            return this.length;
        };

        Pcb.prototype.getPc = function () {
            return this.pc;
        };

        Pcb.prototype.getIr = function () {
            this.ir;
        };

        Pcb.prototype.getAcc = function () {
            this.acc;
        };

        Pcb.prototype.getX = function () {
            this.x;
        };

        Pcb.prototype.getY = function () {
            this.y;
        };

        Pcb.prototype.getZ = function () {
            this.z;
        };

        Pcb.prototype.displayReadyQueue = function () {
            var table = "<table>";

            for (var i = 0; i < _ResidentQueue.length; i++) {
                var temp = _ResidentQueue[i];
                table += "<tr>";
                table += "<td>" + temp.getPid().toString() + "</td>";
                table += "<td>" + temp.getBase().toString() + "</td>";
                table += "<td>" + temp.getLimit().toString() + "</td>";
                table += "<td>" + temp.getState().toString() + "</td>";
                table += "<td>" + temp.getPc().toString() + "</td>";
                table += "<td>" + temp.getLimit().toString() + "</td>";
                table += "<td>" + temp.getIr().toString() + "</td>";
                table += "<td>" + temp.getAcc().toString() + "</td>";
                table += "<td>" + temp.getX().toString() + "</td>";
                table += "<td>" + temp.getY().toString() + "</td>";
                table += "<td>" + temp.getZ().toString() + "</td>";
                table += "</tr>";
            }
            table += "</table>";
            document.getElementById("readyQueue").innerHTML = table;
        };
        Pcb.PID = -1;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
