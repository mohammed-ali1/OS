/**
 * Created by anwar on 9/28/14.
 */

module TSOS {
    export class Memory {
        constructor(public location, public size = 256) {
        }

        public getSize() {
            return this.size;
        }

        public static createTable() {

            _MainMemory = new Array();

            if(_MainMemorySize == 256)
                _MainMemorySegment++;
            if(_MainMemorySize == 256 * 2)
                _MainMemorySegment++;
            if(_MainMemorySize == 256 * 3)
                _MainMemorySegment++;


            var table = "<table>"
            for(var i=0; i<_MainMemorySize;i+=8){
                table += "<tr class='tr'>";
                _MainMemory[i] = i.toString(16).toUpperCase();
                table += "<td class='td'>" + "["+ _MainMemorySegment + "x" + _MainMemory[i] + "]" + "</td>";

                for(var j=i+1; j<=i+7;j++){

                    _MainMemory[j] = j.toString(16).toUpperCase();
                    table += "<td class='td'>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table +="</table>";

            document.getElementById("table").innerHTML = table;
        }
    }
}