///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />

/* ------------
   Shell.ts

   The OS Shell - The "command line interface" (CLI) for the console.
   ------------ */

// TODO: Write a base class / prototype for system services and let Shell inherit from it.

module TSOS {
    export class Shell {
        // Properties
        public promptStr = "=>";
        public commandList = [];
        public curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
        public apologies = "[sorry]";

        constructor() {
        }

        public init() {
            var sc = null;
            //
            // Load the command list.

            // ver
            sc = new ShellCommand(this.shellVer,
                                  "ver",
                                  "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new ShellCommand(this.shellDate,
                "date",
                "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            //whereami
            sc = new ShellCommand(this.shellWhereami,
                "whereami",
                "- Displays where am I.");
            this.commandList[this.commandList.length] = sc;

            //surprise
            sc = new ShellCommand(this.shellSurprise,
                "surprise",
                "- Surprises you with my favorite number.");
            this.commandList[this.commandList.length] = sc;

            //BSOD
            sc = new ShellCommand(this.shellBSOD,
                "bsod",
                "- Are you sure you wanna try this?.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new ShellCommand(this.shellLoad,
                "load",
                "- Validates the User Program Input.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new ShellCommand(this.shellStatus,
                "status",
                "- Changes the status message specified by User.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new ShellCommand(this.shellHelp,
                                  "help",
                                  "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new ShellCommand(this.shellShutdown,
                                  "shutdown",
                                  "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new ShellCommand(this.shellCls,
                                  "cls",
                                  "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new ShellCommand(this.shellMan,
                                  "man",
                                  "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new ShellCommand(this.shellTrace,
                                  "trace",
                                  "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new ShellCommand(this.shellRot13,
                                  "rot13",
                                  "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new ShellCommand(this.shellPrompt,
                                  "prompt",
                                  "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new ShellCommand(this.shellRun,
                "run",
                "<pid> - Executes the current pid from Memory.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new ShellCommand(this.shellClearMem,
                "clearmem",
                "- Clears all the partitions in the memory");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new ShellCommand(this.shellQuantum,
                "quantum",
                "- <number> - Set the Quantum.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new ShellCommand(this.shellPs,
                "ps",
                "- Prints all the active Processes.");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new ShellCommand(this.shellKill,
                "kill",
                "- <pid> Allows the user to kill an active process");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new ShellCommand(this.shellRunAll,
                "runall",
                "- Runs all the Processes in the Resident Queue.");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.

            //
            // Display the initial prompt.
            this.putPrompt();
        }

        public putPrompt() {
            _StdOut.putText(this.promptStr);
        }

        public handleInput(buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);
            //
            // Parse the input...
            //
            var userCommand = new UserCommand();
            userCommand = this.parseInput(buffer);
            // ... and assign the command and args to local variables.
            var cmd = userCommand.command;
            var args = userCommand.args;
            //
            // Determine the command and execute it.
            //
            // JavaScript may not support associative arrays in all browsers so we have to
            // iterate over the command list in attempt to find a match.  TODO: Is there a better way? Probably.
            var index = 0;
            var found = false;
            var fn = undefined;
            while (!found && index < this.commandList.length) {
                if (this.commandList[index].command === cmd) {
                    found = true;
                    fn = this.commandList[index].func;
                } else {
                    ++index;
                }
            }
            if (found) {
                this.execute(fn, args);
            } else {
                // It's not found, so check for curses and apologies before declaring the command invalid.
                if (this.curses.indexOf("[" + Utils.rot13(cmd) + "]") >= 0) {     // Check for curses. {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {    // Check for apologies. {
                    this.execute(this.shellApology);
                } else { // It's just a bad command. {
                    this.execute(this.shellInvalidCommand);
                }
            }
        }

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        public execute(fn, args?) {
            // We just got a command, so advance the line...
            _StdOut.advanceLine();
            // ... call the command function passing in the args...
            fn(args);
            // Check to see if we need to advance the line again
            if (_StdOut.currentXPosition > 0) {
                _StdOut.advanceLine();
            }
            // ... and finally write the prompt again.
            this.putPrompt();
        }

        public parseInput(buffer) {
            var retVal = new UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();  // Yes, you can do that to an array in JavaScript.  See the Queue class.
            // 4.1 Remove any left-over spaces.
            cmd = Utils.trim(cmd);
            // 4.2 Record it in the return value.
            retVal.command = cmd;

            // 5. Now create the args array from what's left.
            for (var i in tempList) {
                var arg = Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        }

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        public shellInvalidCommand() {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        }

        public shellCurse() {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        }

        public shellApology() {
           if (_SarcasticMode) {
              _StdOut.putText("Okay. I forgive you. This time.");
              _SarcasticMode = false;
           } else {
              _StdOut.putText("For what?");
           }
        }

        /**
         * Renders the OS Name and Version.
         * @param args
         */
        public shellVer(args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        }

        /**
         * Renders the current Date Object.
         */
        public shellDate(){
            _StdOut.putText("" + new Date().toDateString() + " " + new Date().toLocaleTimeString());
        }

        /**
         * Prints PI.
         */
        public shellSurprise(){
            _StdOut.putText("My favorite number is " + Math.PI);
        }

        /**
         * Prints the location.
         */
        public shellWhereami(){
            _StdOut.putText("I'm stuck in a loop....");
        }

        /**
         * Draws a blue screen over the canvas.
         */
        public shellBSOD(){

           _Console.currentXPosition = 0;
           _Console.currentYPosition = 0;
           var image = new Image();
           image.src = "dist/images/bsod.jpg";
           _DrawingContext.clearRect(0, 0, 500,500);
           _DrawingContext.drawImage(image, 0, 0,500,500);
           _Kernel.krnShutdown();
        }

        /**
         * Loads the user input program if any,
         * and validates HEX (at the moment).
         */
        public shellLoad(){

            var f =  document.getElementById("taProgramInput").value;
            var x = f.replace(/\s/g,'');

            if(x.length == 0 || x.length % 2 !=0){
                _StdOut.putText("Invalid Input!");
                return;
            }

            for(var i=0; i<x.length;i++){

                var temp = x.charCodeAt(i);

                if((temp == 32) || (temp >=65 && temp<=70) || (temp >=48 && temp<=57) || (temp >=97 && temp <=102)){
                    continue;
                }else{
                    _StdOut.putText("FOUND INVALID HEX CHARACTER!");
                    return;
                }
            }

//            Get the free block first!
            var base = _MemoryManager.getFreeBlock();

            if(base == -1)
                return;
            //Create New PCB
            var p = new Pcb(base,(base+255),true);  //Memory Size is 256...so base and limit works (for now)!
            p.setLength((x.length/2)); //set the length of the program.
            p.setState(9999999999999999999999999);//set state "NEW"

            //Load in the Resident Queue
            _ResidentQueue[p.getPid()] = p;

            //Print to Console
            _StdOut.putText("Loaded Successfully!");
            _Console.advanceLine();
            _StdOut.putText("Process ID: " + p.getPid());

            //Finally load into Memory
            _MemoryManager.load(base,x.toUpperCase().toString());

            Shell.updateResident();
        }

        public static updateResident(){
            var tableView = "<table>";
            tableView +="<th>PID</th>";
            tableView +="<th>Base</th>";
            tableView +="<th>Limit</th>";
            tableView +="<th>State</th>";
            tableView +="<th>Memory Location</th>";
            for(var i =0; i<_ResidentQueue.length;i++) {

                var s:TSOS.Pcb = _ResidentQueue[i];
                tableView += "<tr>";
                tableView += "<td>" + s.getPid().toString() + "</td>";
                tableView += "<td>" + s.getBase().toString() + "</td>";
                tableView += "<td>" + s.getLimit().toString() + "</td>";
                tableView += "<td>" + s.getState().toString()+ "</td>";
//                tableView += "<td>" + s.inMemory().toString()+"</td>";
                tableView += "</tr>";
            }
            tableView += "</table>";
            document.getElementById("displayResident").innerHTML = tableView;
        }

//        public static updateReady(p:Pcb){
//
//            var tableView = "<table>";
//            tableView +="<th>PID</th>";
//            tableView +="<th>Base</th>";
//            tableView +="<th>Limit</th>";
//            tableView +="<th>State</th>";
//            tableView +="<th>Memory Location</th>";
//
//            var s:TSOS.Pcb = _ResidentQueue[p.getPid()];
//            if(s.getState() =="Running") {
//                tableView += "<tr>";
//                tableView += "<td>" + s.getPid().toString() + "</td>";
//                tableView += "<td>" + s.getBase().toString() + "</td>";
//                tableView += "<td>" + s.getLimit().toString() + "</td>";
//                tableView += "<td>" + s.getState().toString() + "</td>";
////                   tableView += "<td>" + s.inMemory().toString()+"</td>";
//                tableView += "</tr>";
//            }
//
//            tableView += "</table>";
//            document.getElementById("readyQueue").innerHTML = tableView;
//        }

        /**
         * Changes the status of the system.
         *
         * @param args, the status to change.
         */
        public shellStatus(args){

            if(args.length>0){

                var s = "";

                for(var i=0; i<args.length;i++){
                    s += args[i];
                    s += " " ;
                }
                document.getElementById("status").innerHTML = "Status: " + s;
            }
        }

        public shellHelp(args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        }

        public shellShutdown(args) {
             _StdOut.putText("Shutting down...");
             // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        }

        public shellCls(args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        }

        public shellMan(args) {
            if (args.length > 0) {
                var topic = args[0];
                switch (topic) {
                    case "help":
                        _StdOut.putText("Help displays a list of (hopefully) valid commands.");
                        break;
                    default:
                        _StdOut.putText("No manual entry for " + args[0] + ".");
                }
            } else {
                _StdOut.putText("Usage: man <topic>  Please supply a topic.");
            }
        }

        public shellTrace(args) {
            if (args.length > 0) {
                var setting = args[0];
                switch (setting) {
                    case "on":
                        if (_Trace && _SarcasticMode) {
                            _StdOut.putText("Trace is already on, dumbass.");
                        } else {
                            _Trace = true;
                            _StdOut.putText("Trace ON");
                        }

                        break;
                    case "off":
                        _Trace = false;
                        _StdOut.putText("Trace OFF");
                        break;
                    default:
                        _StdOut.putText("Invalid arguement.  Usage: trace <on | off>.");
                }
            } else {
                _StdOut.putText("Usage: trace <on | off>");
            }
        }

        public shellRot13(args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + Utils.rot13(args.join(' ')) +"'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        }

        public shellPrompt(args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        }

        public shellQuantum(args){
            if(args.length >0){
                if(args >0){
                    _Quantum = args;
                    _StdOut.putText("Quantum set to: " +_Quantum);
                }else {
                    _Quantum = 6;
                    _StdOut.putText("Quantum set to: "+ _Quantum);
                }
            }else{
                _StdOut.putText("pasarme la perra quamtum");
            }
        }

        public shellPs(){
            for(var i=0; i<_ResidentQueue.length;i++){
                var temp : TSOS.Pcb = _ResidentQueue[i];
                if(temp.getState() == "Running"){
                    _StdOut.putText("Pid: " +temp.getPid());
                    _Console.advanceLine();
                }
            }
        }

        /**
         * Clears Memory Partitions
         */
        public shellClearMem(){
            _StdOut.putText("Memory Wiped!");
            _MemoryManager.clearMemory();
        }

        /**
         *
         * @param args
         */
        public shellKill(args){

            var killThisBitch:TSOS.Pcb;

            if(_CurrentProcess.getPid() == args){
                _CurrentProcess.setState(5);
                _CurrentProcess.displayPCB();
                _StdOut.putText("Killed Current Process: "+_CurrentProcess.getPid());
                return;
            }

            for(var i=0; i<_ResidentQueue.length;i++){
                if(_ResidentQueue[i].getPid() == args &&
                    _ResidentQueue[i].getState() !="Running" &&
                    _ResidentQueue[i].inMemory()){
                    _StdOut.putText("I'm not even Running...WTF!");
                }
                if(_ResidentQueue[i].getPid() == args &&
                    _ResidentQueue[i].getState() == "Running" &&
                    _ResidentQueue[i].inMemory()) {     //Kill the process
                    killThisBitch = _ResidentQueue[i];
                    killThisBitch.setState(5);
                    killThisBitch.displayPCB();
                    _StdOut.putText("Process Killed: "+killThisBitch.getPid());
                    _StdOut.advanceLine();
                    _CPU.init();
                    _CPU.displayCPU();
                    //clear memory block from the base.....???
                }
            }
        }

        /**
         * Run a single program
         * @param args
         */
        public shellRun(args){

            if(_StepButton){
//                args[0].setState(1);
                _StdOut.putText("Single Step is on!");
                return;
            }

            if(_ResidentQueue[args].getState() == "New") {
                _ReadyQueue.enqueue(_ResidentQueue[args]);
            }
            else{
                _StdOut.putText("Load this Bitch again and RUN...!");
            }
//            this.displayReadyQueue(_CurrentProcess);
        }

        public displayReadyQueue(p:Pcb){

            var table = "<table>";
                table += "<tr>";
                table += "<td>" + p.getPid() + p.getBase() + p.getLimit() +"</td>";
                table += "</tr>";
            document.getElementById("readyQueue").innerHTML = table + "</table>";
        }

        public shellRunAll(){

            for(var i=0; i<_ResidentQueue.length;i++){
                _ReadyQueue.enqueue(_ResidentQueue[i]);
            }
        }
    }
}
