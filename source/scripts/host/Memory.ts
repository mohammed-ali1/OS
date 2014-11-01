/**
 * Created by anwar on 9/28/14.
 */

module TSOS {
    export class Memory {

        public segment:number;
        public programLength:number = 0;

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

            if(temp / _MemoryPartitions == 256*1)
                this.segment = 0;
            if(temp / _MemoryPartitions == 256*2)
                this.segment = 1;
            if(temp / _MemoryPartitions == 256*3)
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

        /**
         * Store in memory str, at address index
         * @param index
         * @param str
         */
        public store(index: number, str:string){
            _MainMemory[index] = str;
        }

        /**
         * Loads the program into the Main Memory
         */
        public loadProgram(base ,str){

            var x = str.replace(/^\s+|\s+$/g,'');
                x = str.trim();
                this.programLength = base + (x.length / 2);
            var a = 0, b = 2;
            //Need to load carefully Here!
            for(var i=base; i< base+(x.length/2);i++){

                var s = x.substring(a,b);
                _MainMemory[i] = s;
                a = b;
                b += 2;
            }
//            Update the Memory
            this.updateMemory();
        }

        /**
         * Updates the Memory with the current base and the length. - add borders to the program input
         */
        public updateMemoryWithBase(base){

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
                for(var j=i; j<=i+7;j++) {
                    if ((j+base) <= (j+this.programLength)) {
                        table += "<td style='border: 1px solid;'>" + _MainMemory[j] + "</td>";
                    } else {
                        table += "<td>" + _MainMemory[j] + "</td>";
                    }
                }
                table += "</tr>";
            }
            table +="</table>";
            document.getElementById("table").innerHTML = table;
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
                    table += "<td>" + _MainMemory[j] + "</td>";
                }
                table += "</tr>";
            }
            table +="</table>";
            document.getElementById("table").innerHTML = table;
            this.programLength = -1;
        }

        public clearMemory(){

            for(var i=0; i<_MainMemorySize;i++){
                _MainMemory[i] = "00";
            }
            this.programLength = -1;
            this.updateMemory();
        }

        public size(){
            return _MainMemorySize;
        }

        public getBlock_0():number{
            return  0;
        }

        public getBlock_1():number{
            return  256;
        }

        public getBlock_2():number{
            return  512;
        }
    }
}