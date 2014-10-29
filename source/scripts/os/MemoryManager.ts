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

        public load(base ,str:string){
            _Memory.loadProgram(base, str);
        }

        public clearMemory(){
            _Memory.clearMemory();

        }

        public update(){
            _Memory.updateMemory();
        }

        public size():number{
           return _Memory.size();
        }

        public getFreeBlock():number{

            var block0 = _Memory.read(_Memory.getBlock_0());
            var block1 = _Memory.read(_Memory.getBlock_1());
            var block2 = _Memory.read(_Memory.getBlock_2());

            if(block0 == "00"){//Block 0
                return _Memory.getBlock_0();
            }else if(block0 =="00" && block1 !="00" && block2 !="00"){ //Block 0
                return _Memory.getBlock_0();
            }else if(block0 !="00" && block1 =="00"){ //Block 1
                return _Memory.getBlock_1();
            }else if(block0 !="00" && block1 !="00" && block2 =="00"){
                return _Memory.getBlock_2();
            }else{
                _StdOut.putText("NO ROOM FOR YO BITCH!!!");
                return -1;
            }
        }
    }
}