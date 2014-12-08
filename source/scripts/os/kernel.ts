/* ------------
     Kernel.ts

     Requires globals.ts

     Routines for the Operating System, NOT the host.

     This code references page numbers in the text book:
     Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
     ------------ */

module TSOS {

    export class Kernel {
        //
        // OS Startup and Shutdown Routines
        //
        public krnBootstrap() {      // Page 8. {
            Control.hostLog("bootstrap", "host");  // Use hostLog because we ALWAYS want this, even if _Trace is off.

            // Initialize our global queues.
            _KernelInterruptQueue = new Queue();  // A (currently) non-priority queue for interrupt requests (IRQs).
            _KernelBuffers = new Array();         // Buffers... for the kernel.
            _KernelInputQueue = new Queue();      // Where device input lands before being processed out somewhere.
            _Console = new Console();          // The command line interface / console I/O device.

            // Initialize the console.
            _Console.init();

            // Initialize standard input and output to the _Console.
            _StdIn  = _Console;
            _StdOut = _Console;

            //Initialize Ready Queue for the Processes to be loaded
            _ReadyQueue = new Queue();
            _TerminatedQueue = new Array();

            //Initialize Resident Queue
            _ResidentQueue = new Array();
            _CurrentScheduler = new Scheduler("rr");

            //Initialize and load file system Device Driver
            _FileSystem = new FileSystem();
            _FileSystem.launch();
            this.krnTrace("Loading the File System device driver.");


            // Load the Keyboard Device Driver
            this.krnTrace("Loading the keyboard device driver.");
            _krnKeyboardDriver = new DeviceDriverKeyboard();     // Construct it.
            _krnKeyboardDriver.driverEntry();                    // Call the driverEntry() initialization routine.
            this.krnTrace(_krnKeyboardDriver.status);

            //
            // ... more?
            //

            // Enable the OS Interrupts.  (Not the CPU clock interrupt, as that is done in the hardware sim.)
            this.krnTrace("Enabling the interrupts.");
            this.krnEnableInterrupts();

            // Launch the shell.
            this.krnTrace("Creating and Launching the shell.");
            _OsShell = new Shell();
            _OsShell.init();

            // Finally, initiate testing.
            if (_GLaDOS) {
                _GLaDOS.afterStartup();
            }
        }

        public krnShutdown() {
            this.krnTrace("begin shutdown OS");
            // TODO: Check for running processes.  Alert if there are some, alert and stop.  Else...
            // ... Disable the Interrupts.
            this.krnTrace("Disabling the interrupts.");
            this.krnDisableInterrupts();
            //
            // Unload the Device Drivers?
            // More?
            //
            this.krnTrace("end shutdown OS");
        }

        public krnOnCPUClockPulse() {
            /* This gets called from the host hardware sim every time there is a hardware clock pulse.
             This is NOT the same as a TIMER, which causes an interrupt and is handled like other interrupts.
             This, on the other hand, is the clock pulse from the hardware (or host) that tells the kernel
             that it has to look for interrupts and process them if it finds any.                           */

            // Check for an interrupt, are any. Page 560
            if (_KernelInterruptQueue.getSize() > 0) {
                // Process the first interrupt on the interrupt queue.
                // TODO: Implement a priority queue based on the IRQ number/id to enforce interrupt priority.
                var interrupt = _KernelInterruptQueue.dequeue();
                _Mode = 0;
                this.krnInterruptHandler(interrupt.irq, interrupt.params);
            }else if(_CPU.isExecuting && (_CurrentSchedule == "fcfs" || _CurrentSchedule == "priority")){
                _CPU.cycle();
                Shell.updateReadyQueue();
            }else if(_CPU.isExecuting && (_CurrentSchedule == "rr")){
                if(_ClockCycle >= _Quantum){
                    _Mode = 0;
                    _ClockCycle = 0;
                    this.krnInterruptHandler(_ContextSwitch,0);
                }else{
                    _CPU.cycle();
                    _ClockCycle++;
                    Shell.updateReadyQueue();
                }
            }else { // If there are no interrupts and there is nothing being executed then just be idle.
                this.krnTrace("Idle");
                _Mode = 1;
            }
        }
        //
        // Interrupt Handling
        //
        public krnEnableInterrupts() {
            // Keyboard
            Devices.hostEnableKeyboardInterrupt();
            // Put more here.
        }

        public krnDisableInterrupts() {
            // Keyboard
            Devices.hostDisableKeyboardInterrupt();
            // Put more here.
        }

        public krnInterruptHandler(irq, params) {
            // This is the Interrupt Handler Routine.  Pages 8 and 560. {
            // Trace our entrance here so we can compute Interrupt Latency by analyzing the log file later on.  Page 766.
            _Mode = 0;
            this.krnTrace("Handling IRQ~" + irq);
            // Invoke the requested Interrupt Service Routine via Switch/Case rather than an Interrupt Vector.
            // TODO: Consider using an Interrupt Vector in the future.
            // Note: There is no need to "dismiss" or acknowledge the interrupts in our design here.
            //       Maybe the hardware simulation will grow to support/require that in the future.
            switch (irq) {
                case TIMER_IRQ:
                    this.krnTimerISR();              // Kernel built-in routine for timers (not the clock).
                    break;
                case KEYBOARD_IRQ:
                    _krnKeyboardDriver.isr(params);   // Kernel mode device driver
                    _StdIn.handleInput();
                    break;
                case _NextButton:
                    _CurrentProcess.setState(1);
                    _CPU.cycle();
                    if(_CPU.PC > _CurrentProcess.getLength()){ //Use the program length to break
                        Control.hostStopButton_click(this); //helps us exit next button!
                        _CurrentProcess.setState(4);
                        _CPU.reset();
                        _CPU.displayCPU();
                    }
                    break;
                case _SystemCall:
                    if(params == 1){
                        _StdOut.putText(_CPU.Yreg.toString());
                    }
                    if (params == 2){
                        var address  = _CPU.Yreg;
                        var print = "";
                        var temp = parseInt(_MemoryManager.read(address),16);
                        var index = 0;
                        while (temp != "00"){
                            print += String.fromCharCode(temp).toString();
                            index++;
                            temp = parseInt(_MemoryManager.read(parseInt(index+address)),16);
                        }
                        _StdOut.putText(print);
                    }
                    _Console.advanceLine();
                    _OsShell.putPrompt();
                    break;
                case _Break: //-1 Denotes END of a process!
                    _CPU.reset();//Re-Start the CPU!
                    _CPU.displayCPU(); // commented because, we can test if it syncs with PCB!
                    _CurrentProcess.setState(4);
                    _CurrentProcess.setTimeFinished(_OSclock);
                    Pcb.displayTimeMonitor();
                    _Kernel.krnTrace("\n\nTERMINATING PID: "+_CurrentProcess.getPid()+"\n");
                    Shell.updateReadyQueue();
                    this.handleSchedule();
                    break;
                case _InvalidOpCode:
                    _StdOut.putText("WTF is this Instruction?");
                    break;
                case _RUN:
                    //need to look at current scheduler first
                    if(_CPU.isExecuting){
                        _ReadyQueue.enqueue(params);
                    }else{
                        _ReadyQueue.enqueue(params);
                        _CurrentScheduler.rr();
                    }
                    break;
                case _RUNALL:
                    //need to look at current scheduler first
                    _CurrentScheduler.rr();
                    break;
                case _ContextSwitch:
                    this.contextSwitch();
                    break;
                case _Killed:
                    this.krnTrace("\n\nKILLING PID: "+params.getPid()+"\n");
                    Shell.updateReadyQueue();
                    break;
                case _MemoryBoundError:
                    _StdOut.putText("Memory Limit Reached for PID: "+params.getPid());
                    //throw a bsod
                    params.setState(4);
                    _ClockCycle = 0;
                    _CPU.reset();
                    this.bsod("Illegal Memory Access");
                    this.krnShutdown();
                    break;
                case _KilledReset:
                    params.setState(5);
                    _StdOut.putText("Killed PID: " +params.getPid());
                    Shell.updateReadyQueue();
                    _ClockCycle = 0;
                    this.krnInterruptHandler(_RUNALL,0);
                    _CPU.reset();
                    break;
                case _KilledRunAll:
                    params.setState(5);
                    _StdOut.putText("Killed PID: " +params.getPid());
                    Shell.updateReadyQueue();
                    _ClockCycle = 0;
                    this.krnInterruptHandler(_RUNALL, 0);
                    break;
                case _BSOD:
                    this.bsod(params);
                    break;
                case _SCHEDULE:
                    this.handleSchedule();
                    break;
                default:
                    this.krnTrapError("Invalid Interrupt Request. irq=" + irq + " params=[" + params + "]");
            }
        }

        public krnTimerISR() {
            // The built-in TIMER (not clock) Interrupt Service Routine (as opposed to an ISR coming from a device driver). {
            // Check multiprogramming parameters and enforce quanta here. Call the scheduler / context switch here if necessary.
        }


        // System Calls... that generate software interrupts via tha Application Programming Interface library routines.
        //
        // Some ideas:
        // - ReadConsole
        // - WriteConsole
        // - CreateProcess
        // - ExitProcess
        // - WaitForProcessToExit
        // - CreateFile
        // - OpenFile
        // - ReadFile
        // - WriteFile
        // - CloseFile


        //
        // OS Utility Routines
        //
        public krnTrace(msg: string) {
             // Check globals to see if trace is set ON.  If so, then (maybe) log the message.
             if (_Trace) {
                if (msg === "Idle") {
                    // We can't log every idle clock pulse because it would lag the browser very quickly.
                    if (_OSclock % 10 == 0) {
                        // Check the CPU_CLOCK_INTERVAL in globals.ts for an
                        // idea of the tick rate and adjust this line accordingly.
                        Control.hostLog(msg, "OS");
                    }
                }
                else {
                    Control.hostLog(msg, "OS");
                }
             }
        }

        public krnTrapError(msg) {
            Control.hostLog("OS ERROR - TRAP: " + msg);
            // TODO: Display error on console, perhaps in some sort of colored screen. (Perhaps blue?)
            this.krnShutdown();
        }


        /**
         * Context Switches to the next process after saving the current state
         */
        public contextSwitch(){

            if(_ReadyQueue.isEmpty() && (_CurrentProcess.getState() == "Terminated" ||
                                        _CurrentProcess.getState() == "Killed")){
                _CPU.reset();

            }else {
                _CurrentProcess.setPc(_CPU.PC);
                _CurrentProcess.setAcc(_CPU.Acc);
                _CurrentProcess.setX(_CPU.Xreg);
                _CurrentProcess.setY(_CPU.Yreg);
                _CurrentProcess.setZ(_CPU.Zflag);
                _CurrentProcess.setIr(_CPU.IR);
                _CurrentProcess.setState(2); //set state to waiting

                //push back onto the queue
                _ReadyQueue.enqueue(_CurrentProcess);

                //grab the next process
                _CurrentProcess = _ReadyQueue.dequeue();

                //record arrival time if state == ready
                if(_CurrentProcess.getState() == "Ready"){
                    _CurrentProcess.setTimeArrived(_OSclock);
                    Pcb.displayTimeMonitor();
                }
                if(_CurrentProcess.getLocation() == "Disk"){
                    this.contextSwitchDisk(true,false,false);
//                    return;
                }
                    //keep executing
                    _Kernel.krnTrace("\nCONTEXT SWITCH TO PID: " + _CurrentProcess.getPid() + "\n");
                    _CurrentProcess.setState(1); //set state to running
                    Shell.updateReadyQueue();
                    _CPU.startProcessing(_CurrentProcess);
                    _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");

            }
        }


        public getNextAvailableBlock(){
            var index:number = _ResidentQueue.indexOf(_CurrentProcess);
            index =  (index - 3);
            if(index < 0){
                var residentIndex:number = _ResidentQueue.indexOf(_CurrentProcess);
                index = (_ResidentQueue.length-3) + Math.abs(residentIndex);
            }
            return _ResidentQueue[index];
        }


        /**
         * This gets called whenever
         * we need to load a process
         * from the disk.
         * @param rr
         * @param fcfs
         * @param priority
         */
        public contextSwitchDisk(rr,fcfs,priority){

            if(rr){
                var nextProcess:TSOS.Pcb = this.getNextAvailableBlock();
//                alert("current pid: "+_CurrentProcess.getPid()+", loc: "+_CurrentProcess.getLocation()
//                +"\n next pid: "+nextProcess.getPid()+", loc: "+nextProcess.getLocation());
                _FileSystem.rollIn(_CurrentProcess,nextProcess);
                _Kernel.krnTrace("\nCONTEXT SWITCH TO PID: " + _CurrentProcess.getPid() + "\n");
                Shell.updateReadyQueue();
                _CPU.startProcessing(_CurrentProcess);
                _Kernel.krnTrace("\nPROCESSING PID: " + _CurrentProcess.getPid() + "\n");
            }
            if(fcfs){
                alert("PID: "+_CurrentProcess.getPid()+", LOC: "+_CurrentProcess.getLocation());
                _CurrentProcess.setLocation("Memory");
                _CurrentProcess.setPrintLocation("Disk -> Memory");
                //set the least running process to "TRASH"
                this.setToTrash();
                _FileSystem.swap(_CurrentProcess, (_BlockSize/_BlockSize)-1);
                _CurrentProcess.setState(1);
                _CPU.startProcessing(_CurrentProcess);
            }

            if(priority){

            }
        }


        /**
         * Finds next process in ready queue whose state == "Memory"
         * and sets the state to "Trash"
         */
        public setToTrash(){

            var process;
            for(var i =0 ; i<_ResidentQueue.length;i++){
                process = _ResidentQueue[i];
                if(process.getLocation() == "Memory"){
                    process.setLocation("Trash");
                    process.setPrintLocation("Memory -> Trash");
                    break;
                }
            }
        }

        /**
         * Throws a BSOD Error.
         */
        public bsod(message1):void{

            _DrawingContext.clearRect(0,0,_Canvas.width,_Canvas.height);
            _DrawingContext.fillStyle = "blue";
            _DrawingContext.fillRect(0,0,_Canvas.width,_Canvas.height);
            _DrawingContext.drawText("sans",20,50,150,message1);
            _DrawingContext.drawText("sans",20,50,250,"Why do you think this happened?");
            _CPU.reset();
            this.krnShutdown();
        }

        /**
         * Handles all the scheduling algorithms
         */
        public handleSchedule(){

            if(_CurrentSchedule == "fcfs"){
                _CurrentScheduler.fcfs();
            }

            if(_CurrentSchedule == "rr"){
                _CurrentScheduler.rr();
            }

            if(_CurrentSchedule == "priority"){
                _CurrentScheduler.priority();
            }
        }
    }
}