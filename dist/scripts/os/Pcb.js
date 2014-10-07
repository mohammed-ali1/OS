/**
* Created by anwar on 10/4/14.
*/
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(pc, acc, x, y, z) {
            this.pc = 0;
            this.acc = "";
            this.x = "";
            this.y = "";
            this.z = "";
        }
        Pcb.prototype.updatePCB = function () {
        };
        Pcb.PID = 0;
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
