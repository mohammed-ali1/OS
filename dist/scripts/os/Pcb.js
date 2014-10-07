/**
* Created by anwar on 10/4/14.
*/
var TSOS;
(function (TSOS) {
    var Pcb = (function () {
        function Pcb(pid, base, limit) {
            if (typeof pid === "undefined") { pid = -1; }
            if (typeof base === "undefined") { base = -1; }
            if (typeof limit === "undefined") { limit = -1; }
            this.pid = pid;
            this.base = base;
            this.limit = limit;
        }
        return Pcb;
    })();
    TSOS.Pcb = Pcb;
})(TSOS || (TSOS = {}));
