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

            var p;
            var q;
            var hexString:string = "";
            for(var i = 0; i<str.length;i+=2){

                p = str.charAt(i);
                q = str.charAt(i+1);
                hexString += String.fromCharCode(parseInt((p+q),16)).toString();

            }
            return hexString;
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
        public createMBR(localStorage,size,map:Map){
            var data:string = this.stringToHex("BAD ASS OS");
            var pad:string = this.padding("1###"+data,size);
            var key = this.makeKey(0,0,0);
            localStorage.setItem(key,pad);
            map.set(key,new File("BAD ASS OS",pad));
        }

        /**
         * Creates a local file system.
         * Use this method when format is called.
         */
        public format(trackSize,sectorSize,blockSize,dataSize, localStorage){

            var storage = this.formatData(dataSize);
            var dir = 0;
            var data = 0;

            for (var track = 0; track < trackSize; track++) {
                for (var sector = 0; sector < sectorSize; sector++) {
                    for (var block = 0; block < blockSize; block++) {
                        var key = this.makeKey(track,sector,block);
                        localStorage.setItem(key,storage);
                    }
                }
            }
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
            table += "<th style='text-align: left; background-color: transparent;'>TSB</th>";
            table += "<th style='text-align: left; background-color: transparent;'>META</th>";
            table += "<th style='text-align: left; background-color: transparent;'>DATA</th>";
            var len;

            for(var t = 0; t< trackSize;t++){
                for(var s =0; s<sectorSize; s++){
                    for(var b=0;b<blockSize;b++){
                        var key = this.makeKey(t,s,b);
                        var metadata = localStorage.getItem(key);
                        var meta = metadata.slice(0,4);
                        len = meta.length;
                        var data = metadata.slice(4,metadata.length);
                        len = data.length;

                        //add some colors for readability.
                        if(meta.charAt(0) == "1"){
                            table += "<tr style='background-color: transparent'><td>" + t+s+b + " </td>";
                            table += "<td style='color: red; background-color: #ffffff;'>" + meta + " " +  "</td>";
                            table += "<td>" + data + "</td></tr>";
                        }else{
                            table += "<tr style='background-color: transparent'><td>" + t+s+b + " </td>";
                            table += "<td style='color: green; background-color: #ffffff;'>" + meta + " " +  "</td>";
                            table += "<td>" + data + "</td></tr>";
                        }

                    }
                }
            }
            document.getElementById("dirDataTable").innerHTML = table + "</table>";
        }

        /**
         * Makes a new Key in the TSB
         * @param t
         * @param s
         * @param b
         * @returns {string}
         */
        public makeKey(t,s,b){
            return String(t) + String(s) + String(b);
        }

        public getDataIndex(trackSize, sectorSize, blockSize):string{

            for(var t = 1; t<trackSize; t++) {
                for (var s = 0; s < sectorSize; s++) {
                    for (var b = 0; b < blockSize; b++) {

                        var key = this.makeKey(t, s, b);
                        var data = localStorage.getItem(key);
                        var meta = data.slice(0, 1);
                        if (meta == "0") {
                            return key;
                        }
                    }
                }
            }
            return "-1";
        }


        public padBlockSize(contents:string){

            var str = "";
            for(var i=contents.length; i<_BlockSize; i++){
                    str += "0";
            }
            contents += str;

            return contents;
        }
    }
}










