/**
 * Created by anwar on 9/28/14.
 */

module TSOS {
    export class Memory {

        constructor(){

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

                    _MainMemory[j] = 0;
                    table += "<td class='td'>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table +="</table>";

            document.getElementById("table").innerHTML = table;
        }

        public clearMemory(){

            for(var i=0; i<_MainMemorySize;i++){
                _MainMemory[i] = 0;
            }
        }

        /**
         * Loads the program into the Main Memory
         */
        public static loadProgram(str){

            for(var i=0; i<20;i++){
                var x = _MainMemory[i].toString(10);
                if(i%8!=0) {
                    _MainMemory[i] = "AB";
                }
            }

            this.updateMemory();
        }

        public static updateMemory(){

            var table = "<table>";
            for(var i=0; i<_MainMemorySize;i+=8){
                table += "<tr class='tr'>";
                table += "<td class='td'>" + "["+ _MainMemorySegment + "x" + _MainMemory[i] + "]" + "</td>";

                for(var j=i+1; j<=i+7;j++){

                    table += "<td class='td'>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table +="</table>";

            document.getElementById("table").innerHTML = table;
        }
    }
}







