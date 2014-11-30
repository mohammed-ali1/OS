/**
 * Created by anwar on 11/27/14.
 */
module TSOS{
    export class FSU{


        /**
         * Utility class for the File System.
         * Some useful methods which can be useful
         * to write the actual file system.
         */

        constructor(){

        }

        /**
         * Converts String to its hex value
         * @param str
         * @returns {string}
         */
        public stringToHex(str:string):string{

            var s:string = "";
            for(var i = 0; i<str.length;i++){
                s += str.charCodeAt(i).toString(16);
            }
            return s;
        }

        /**
         * Converts hex value to String
         * @param str
         * @returns {string}
         */
        public hexToString(str:string):string{

            var s:string = "";
            for(var i = 0; i<str.length;i++){
                if(str.charAt(i) != "0") {
                    s += str.charCodeAt(i).toString(10);
                }
            }
            return s;
        }



        /**
         * Adds Padding to the string up to the
         * length parameter.
         * @param str
         * @param length
         * @returns {string}
         */
        public padding(str:string,length:number):string{
            var temp:string = "";
            if(str.length> length){
                return str;
            }

            var i = str.length;
            while(i < length){
                temp += "0";
                i++;
            }
            str += temp;
            return str;
        }

        /**
         * Formats the data to all zeroes "0".
         * @param size
         * @returns {string}
         */
        public formatData(size):string{
            var data = "";
            for(var i=0; i<size;i++){
                data += "0";
            }
            return data;
        }

        /**
         * Creates the MBR and adds it to the
         * local storage.
         * @param localStorage
         * @param size
         */
        public createMBR(localStorage,size){
            var data:string = this.stringToHex("MBR");
            var pad:string = this.padding("1###"+data,size);
            var key = this.makeKey(0,0,0);
            localStorage.setItem(key,pad);
        }

        /**
         * Creates a local file system.
         * Use this method when format is called.
         */
        public format(trackSize,sectorSize,blockSize,dataSize, localStorage){

            var storage = this.formatData(dataSize);

            var table = "<table>";
            table += "<th style='text-align: left;'>TSB MBR  Data</th>";

            for (var track = 0; track < trackSize; track++) {

                for (var sector = 0; sector < sectorSize; sector++) {

                    for (var block = 0; block < blockSize; block++) {

                        var key = this.makeKey(track,sector,block);
                        localStorage.setItem(key,storage);
                        var localData = localStorage.getItem(key);
                        var meta: string = localData.slice(0,4);
                        var data: string = localData.slice(4,storage.length);
                        table += "<tr><td>" + track + sector + block + " ";
                        table +=  meta + " " + data + "</td></tr>";

                    }
                }
            }
            document.getElementById("dirDataTable").innerHTML = table + "</table>";
        }

        /**
         * Updates the FilSystem
         * @param trackSize
         * @param sectorSize
         * @param blockSize
         * @param localStorage
         */
        public update(trackSize,sectorSize,blockSize,localStorage){
            var table = "<table>";
            table += "<th style='text-align: left;'>TSB MBR  Data</th>";

            for(var t = 0; t< trackSize;t++){
                for(var s =0; s<sectorSize; s++){
                    for(var b=0;b<blockSize;b++){
                        var key = this.makeKey(t,s,b);
                        var metadata = localStorage.getItem(key);
                        var meta = metadata.slice(0,4);
                        var data = metadata.slice(4,metadata.length);
                        table += "<tr><td>" + t+s+b + " ";
                        table += meta + " " + data + "</td></tr>";
                    }
                }
            }
            document.getElementById("dirDataTable").innerHTML = table + "</table>";
        }

        public makeKey(t,s,b){
            return String(t) + String(s) + String(b);
        }
    }
}