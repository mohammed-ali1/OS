/**
 * Created by anwar on 10/6/14.
 */
module TSOS{

    export class MemoryManager{

        //Address Translation Coming Soon
        //Prior to Project 3!

        constructor(){
            _Memory = new Memory();
        }

        public read(index:number){
                return _Memory.read(index);
        }

        public store(index:number, str:string){
            _Memory.store(index,str);
        }

        public load(str:string){
            _Memory.loadProgram(str);
        }

        public clear(){
            _Memory.clear();
        }

        public update(){
            _Memory.updateMemory();
        }

        public size():number{
           return _Memory.size();
        }
    }
}