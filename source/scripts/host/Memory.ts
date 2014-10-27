/**
 * Created by anwar on 9/28/14.
 */

module TSOS {
    export class Memory {

        public segment:number = -1;
        public str:number = 0;

        constructor(){
            this.createTable();
        }

        /**
         * Creates the Memory inside the Table
         */
        public createTable() {

            _MainMemory = new Array();
            _MainMemoryBase = new Array();

            var temp = _MainMemorySize;

            if(temp == 256)
                this.segment = 0;
            if(temp == 256 * 2)
                this.segment = 1;
            if(temp == 256 * 3)
                this.segment = 2;

            var table = "<table>";

            for(var i=0; i<_MainMemorySize;i+=8){

                _MainMemoryBase[i] = i.toString(16).toUpperCase();
                if(i % 256 == 0){
                    table += "<tr style='background-color: #ffffff;'><td style='font-size: 12px;'>" + "["+
                        this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                else{
                    table += "<tr><td style='font-size: 12px;'>" + "["+
                        this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }

                for(var j=i; j<=i+7;j++){
                    _MainMemory[j] = "00";
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table +="</table>";

            document.getElementById("table").innerHTML = table;
        }

        /**
         * Reads the Memory at the given index
         * @param index
         * @returns {string}
         */
        public read(index:number){
            return _MainMemory[index];
        }

        public store(index: number, str:string){
            _MainMemory[index] = str;
        }

        /**
         * Loads the program into the Main Memory
         */
        public loadProgram(str){

            var x = str.replace(/^\s+|\s+$/g,'');
                x = str.trim();
                this.str = x.length / 2;
            var a = 0, b = 2;

            //Need to load carefully Here!
            for(var i=_Pcb.base; i< x.length/2;i++){

                var s = x.substring(a,b);
                _MainMemory[i] = s;
                a = b;
                b += 2;
            }
            //Update the Memory
            this.updateMemory();
        }

        /**
         * Updates the Memory.
         */
        public updateMemory(){

            var table = "<table>";

            for(var i=0; i<_MainMemorySize;i+=8){

                if(i % 256 == 0){
                    table += "<tr style='background-color: #ffffff;'><td style='font-size: 12px;'>" + "["+
                        this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                else{
                    table += "<tr><td style='font-size: 12px;'>" + "["+
                        this.segment + "x" + _MainMemoryBase[i] + "]" + "</td>";
                }
                for(var j=i; j<=i+7;j++){
                    if(_MainMemory[j] != 0 || j <= this.str-1){
                        table += "<td id='memoryContents'>" + _MainMemory[j] + "</td>";
                    }else{
                        table += "<td>" + _MainMemory[j] + "</td>";
                    }
                }
                table += "</tr>";
            }
            table +="</table>";
            document.getElementById("table").innerHTML = table;
        }

        public clear(){

            for(var i=0; i<_MainMemorySize;i+=8){
                for(var j=i; j<=i+7;j++){
                    _MainMemory[j] = "00";
                }
            }
            this.updateMemory();
        }

        public size(){
            return _MainMemorySize;
        }

        public blah(){

        }
    }
}