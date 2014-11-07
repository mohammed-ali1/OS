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
//                alert("read at: "+parseInt(_CurrentProcess.getBase()+index)+", OP: "+_CPU.IR);
                return _Memory.read(parseInt(_CurrentProcess.getBase()+index));
        }

        public store(index:number, str:string){
//            alert("store at: "+parseInt(_CurrentProcess.getBase()+index)+", str: "+str);
            _Memory.store(parseInt(_CurrentProcess.getBase()+index),str);
        }

        public load(base ,str:string){
            _Memory.loadProgram(base, str);
        }

        public clearMemory(){
            _Memory.clearMemory();
//            _ResidentQueue.splice(0,_ResidentQueue.length);
            Shell.updateResident();
        }

        public update(){
            _Memory.updateMemory();
        }

        public size():number{
           return _Memory.size();
        }

        public clearBlock(base:number){
            _Memory.clearBlock(base);
        }

        public getFreeBlock():number {

//            var block0 = _Memory.read(_Memory.getBlock_0());
//            var block1 = _Memory.read(_Memory.getBlock_1());
//            var block2 = _Memory.read(_Memory.getBlock_2());
//            if(_ResidentQueue.length == 0){
//                return 0;
//            }else if(_ResidentQueue[_ResidentQueue.length-1].getState() !="Running") {
//                return _ResidentQueue[_ResidentQueue.length - 1].getBlock();
//            }else{
//                return -1;
//            }

            var foundBlock:number = -1;
            alert("Getting Block");
            for(var i=0; i<_ResidentQueue.length;i++){

                var temp:TSOS.Pcb = _ResidentQueue[i];

                if(temp.getState() == "Terminated"){
                    this.clearBlock(temp.getBase());
                    foundBlock = temp.getBase();
                    return foundBlock;
                }
            }
            return foundBlock;
            //Need more thinking here!!!
//            if (_ResidentQueue.length == 0) {
//                return 0;
//            } else if (_ResidentQueue.length == 1 && _ResidentQueue[0].getState() != "Terminated") {
//                var s = parseInt(_ResidentQueue[0].getLimit(), 10);
//                return (s + 1);
//            } else if (_ResidentQueue.length == 2 && _ResidentQueue[1].getState() != "Terminated") {
//                var s = parseInt(_ResidentQueue[1].getLimit(), 10);
//                return (s + 1);
//            } else {
//                _StdOut.putText("NO ROOM FOR Y0o BITCH!!!");
//                return -1;
//            }
        }
    }
}