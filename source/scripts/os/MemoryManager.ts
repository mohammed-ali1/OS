/**
 * Created by anwar on 10/6/14.
 */
module TSOS{

    export class MemoryManager{

        constructor(){
            _Memory = new Memory();
        }

        /**
         * Returns the Memory Contents at the index
         * @param index
         * @returns {string}
         */
        public read(index:number){
            if(parseInt(_CurrentProcess.getBase()+index) > parseInt(_CurrentProcess.getLimit()) ||
                parseInt(_CurrentProcess.getBase()+index) < parseInt(_CurrentProcess.getBase())){
                //memory bound interrupt
                _Kernel.krnInterruptHandler(_BSOD,"Illegal Memory Access");
            }else {
                return _Memory.read(parseInt(_CurrentProcess.getBase() + index));
            }
        }

        /**
         * Stores the element at the index
         * @param index
         * @param str
         */
        public store(index:number, str:string){
            if(parseInt(_CurrentProcess.getBase()+index) > parseInt(_CurrentProcess.getLimit()) ||
                parseInt(_CurrentProcess.getBase()+index) < parseInt(_CurrentProcess.getBase())){
                //memory bound interrupt
                _Kernel.krnInterruptHandler(_BSOD,"Illegal Memory Access");
            }else {
                _Memory.store(parseInt(_CurrentProcess.getBase() + index), str);
            }
        }

        public load(base ,str:string){
            _Memory.loadProgram(base, str);
        }

        /**
         * Clears Memory
         */
        public clearMemory(){

            if(_CurrentProcess.getState() == "Running" || _CurrentProcess.getState() == "Waiting"){
                _StdOut.putText("Let me Terminate First.....DAmmmmm!");
            }else{
                _StdOut.putText("Memory Wiped!");
                _Memory.clearMemory();
            }
        }

        /**
         * Updates the Memory
         */
        public update(){
            _Memory.updateMemory();
        }

        /**
         * Returns Memory Size
         * @returns {number}
         */
        public size():number{
           return _Memory.size();
        }

        /**
         * Gets the next available block
         *
         * @returns {number}
         */
        public getBlockAvailable(){

            if(_ResidentQueue.length >= 3){
                return -1;
            }else {

                for (var base = 0; base <= (_BlockSize * 2); base += _BlockSize) {
                    var address = _Memory.read(base);
                    if (address == "00") {
                        return base;
                    }
                }
            }
        }

        public grabProcessContents(process){
            return _Memory.grabProcessContents(process);
        }
    }
}