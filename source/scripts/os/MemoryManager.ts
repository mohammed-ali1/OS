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

//            var block0 = _Memory.read(_Memory.getBlock_0());
//            var block1 = _Memory.read(_Memory.getBlock_1());
//            var block2 = _Memory.read(_Memory.getBlock_2());

            //Need more thinking here!!!
            if(_ResidentQueue.length == 0){
                return 0;
            }else if (_ResidentQueue.length == 1 && _ResidentQueue[0].getState() != "Running" + _ResidentQueue[0].getState() !="Waiting"){
                var s = parseInt(_ResidentQueue[0].getLimit(),16);
                return (s+1);
            }else if (_ResidentQueue.length == 2 && _ResidentQueue[1].getState() != "Running" + _ResidentQueue[1].getState() !="Waiting"){
                var s = parseInt(_ResidentQueue[1].getLimit(),16);
                return (s+1);
            }else {
                _StdOut.putText("NO ROOM FOR Y0o BITCH!!!");
                return -1;
            }
        }
    }
}