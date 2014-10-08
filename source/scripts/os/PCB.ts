/**
 * Created by anwar on 10/4/14.
 */

module TSOS{

    export class Pcb{

        private static PID = -1;
        private pc:number = 0;
        private acc:string = "";
        private x:string = "";
        private y:string = "";
        private z:string = "";
        private base: number=0;
        private limit:number=0;

        constructor(b:number, l:number){

            Pcb.PID++;  //Increment PID all the time!
            this.base = b;
            this.limit = l;

        }

        public displayPDB(){

        }


        public PID(){
            return Pcb.PID;
        }



    }
}