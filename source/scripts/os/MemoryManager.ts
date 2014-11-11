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

            if(_ResidentQueue.length>0){
                _StdOut.putText("Let one of the PROCESS Terminate First.....DAmmmmm!");
            }else{
                _StdOut.putText("I had to Clear Memory for you....Thanks a Lot!");
                _Console.advanceLine();
                _Memory.clearMemory();
            }
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

        public getBlockAvailable(){

//            if(_BeginBase > 512){
//                alert("base > "+_BeginBase);
//                return -1;
//            }
//
//            alert("Begin Base: "+_BeginBase);
//
//            var base = _Memory.read(_BeginBase);
//
//            if(base  == "00"){
//                return _BeginBase;
//                _BeginBase += _BlockSize;
//            }
//
//            for(var j=0; j<_ResidentQueue.length;j++){
//                var free:TSOS.Pcb = _ResidentQueue[j];
//                if(base ==  free.getBase() && free.getState() == "Terminated"){
//                    _BeginBase += _BlockSize;
//                    return free.getBase();
//                }
//            }

            for(var base=0; base<=(_BlockSize*2);base+=_BlockSize){
                var address = _Memory.read(base);
                alert("reading at base: "+base+", address: "+address);
                if(address == "00"){
                    alert("Returning: "+base);
                    _BeginBase += base;
                    return base;
                }

                if(_BeginBase > 512){
                    _BeginBase = 0;
                }

                for(var j=0; j<_ResidentQueue.length;j++){
                    var free:TSOS.Pcb = _ResidentQueue[j];
                    if(base ==  free.getBase() && free.getState() == "Terminated"){
                        _BeginBase += base;
                        alert("Return base as: "+free.getBase());
                        return free.getBase();
                    }
                }
            }
            alert("last -1");
            return -1;
        }

        public  getNextBlock(){
            if(_ResidentQueue.length >= 3){
                return -1;
            }
            return parseInt(_ResidentQueue.length*_BlockSize);
        }

        public getFreeBlock():number {

            alert("RES: "+_ResidentQueue.length);



//            if(_ResidentQueue.length == 3){
//                this.clearMemory();
//                return -1;
//            }

            if(_ResidentQueue.length < 3 ) {
                if (_ResidentQueue.length == 0) {
                    return 0;
                } else if (_ResidentQueue.length == 1) {
                    var s = parseInt(_ResidentQueue[0].getLimit(), 10);
                    return (s + 1);
                } else if (_ResidentQueue.length == 2) {
                    var s = parseInt(_ResidentQueue[1].getLimit(), 10);
                    return (s + 1);
                }
            }else{
                _StdOut.putText("NO ROOM FOR Y0o BITCH!!!");
                return -1;
            }
        }
    }
}