/**
* Created by anwar on 10/4/14.
*/
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(b, l) {
            this.pc = 0;
            this.acc = "";
            this.x = "";
            this.y = "";
            this.z = "";
            this.base = 0;
            this.limit = 0;
            Pcb.PID++; //Increment PID all the time!
            this.base = b;
            this.limit = l;
        }
        Pcb.prototype.displayPDB = function () {
        };

        Pcb.prototype.PID = function () {
            return Pcb.PID;
        };
        Pcb.PID = -1;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
