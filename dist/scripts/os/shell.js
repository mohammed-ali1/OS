///<reference path="shellCommand.ts" />
///<reference path="userCommand.ts" />
///<reference path="../utils.ts" />
/* ------------
Shell.ts
The OS Shell - The "command line interface" (CLI) for the console.
------------ */
// TODO: Write a base class / prototype for system services and let Shell inherit from it.
var TSOS;
(function (TSOS) {
    var Shell = (function () {
        function Shell() {
            // Properties
            this.promptStr = "=>";
            this.commandList = [];
            this.curses = "[fuvg],[cvff],[shpx],[phag],[pbpxfhpxre],[zbgureshpxre],[gvgf]";
            this.apologies = "[sorry]";
        }
        Shell.prototype.init = function () {
            var sc = null;

            //
            // Load the command list.
            // ver
            sc = new TSOS.ShellCommand(this.shellVer, "ver", "- Displays the current version data.");
            this.commandList[this.commandList.length] = sc;

            //date
            sc = new TSOS.ShellCommand(this.shellDate, "date", "- Displays the current date and time.");
            this.commandList[this.commandList.length] = sc;

            //whereami
            sc = new TSOS.ShellCommand(this.shellWhereami, "whereami", "- Displays where am I.");
            this.commandList[this.commandList.length] = sc;

            //surprise
            sc = new TSOS.ShellCommand(this.shellSurprise, "surprise", "- Surprises you with my favorite number.");
            this.commandList[this.commandList.length] = sc;

            //BSOD
            sc = new TSOS.ShellCommand(this.shellBSOD, "bsod", "- Are you sure you wanna try this?.");
            this.commandList[this.commandList.length] = sc;

            //load
            sc = new TSOS.ShellCommand(this.shellLoad, "load", "- Validates the User Program Input.");
            this.commandList[this.commandList.length] = sc;

            //status
            sc = new TSOS.ShellCommand(this.shellStatus, "status", "- Changes the status message specified by User.");
            this.commandList[this.commandList.length] = sc;

            // help
            sc = new TSOS.ShellCommand(this.shellHelp, "help", "- This is the help command. Seek help.");
            this.commandList[this.commandList.length] = sc;

            // shutdown
            sc = new TSOS.ShellCommand(this.shellShutdown, "shutdown", "- Shuts down the virtual OS but leaves the underlying hardware simulation running.");
            this.commandList[this.commandList.length] = sc;

            // cls
            sc = new TSOS.ShellCommand(this.shellCls, "cls", "- Clears the screen and resets the cursor position.");
            this.commandList[this.commandList.length] = sc;

            // man <topic>
            sc = new TSOS.ShellCommand(this.shellMan, "man", "<topic> - Displays the MANual page for <topic>.");
            this.commandList[this.commandList.length] = sc;

            // trace <on | off>
            sc = new TSOS.ShellCommand(this.shellTrace, "trace", "<on | off> - Turns the OS trace on or off.");
            this.commandList[this.commandList.length] = sc;

            // rot13 <string>
            sc = new TSOS.ShellCommand(this.shellRot13, "rot13", "<string> - Does rot13 obfuscation on <string>.");
            this.commandList[this.commandList.length] = sc;

            // prompt <string>
            sc = new TSOS.ShellCommand(this.shellPrompt, "prompt", "<string> - Sets the prompt.");
            this.commandList[this.commandList.length] = sc;

            // run
            sc = new TSOS.ShellCommand(this.shellRun, "run", "<pid> - Executes the current pid from Memory.");
            this.commandList[this.commandList.length] = sc;

            // clearmem
            sc = new TSOS.ShellCommand(this.shellClearMem, "clearmem", "- Clears all the partitions in the memory");
            this.commandList[this.commandList.length] = sc;

            // quantum
            sc = new TSOS.ShellCommand(this.shellQuantum, "quantum", "- <number> - Set the Quantum.");
            this.commandList[this.commandList.length] = sc;

            // ps
            sc = new TSOS.ShellCommand(this.shellPs, "ps", "- Prints all the active Processes.");
            this.commandList[this.commandList.length] = sc;

            // kill
            sc = new TSOS.ShellCommand(this.shellKill, "kill", "- <pid> Allows the user to kill an active process");
            this.commandList[this.commandList.length] = sc;

            // runall
            sc = new TSOS.ShellCommand(this.shellRunAll, "runall", "- Runs all the Processes in the Resident Queue.");
            this.commandList[this.commandList.length] = sc;

            // format
            sc = new TSOS.ShellCommand(this.ShellFormat, "format", "- Formats the File System.");
            this.commandList[this.commandList.length] = sc;

            // create
            sc = new TSOS.ShellCommand(this.ShellCreate, "create", "- <string> Creates a file in the file system.");
            this.commandList[this.commandList.length] = sc;

            // write
            sc = new TSOS.ShellCommand(this.ShellWrite, "write", "- <string> writes the contents to the filename");
            this.commandList[this.commandList.length] = sc;

            // read
            sc = new TSOS.ShellCommand(this.ShellRead, "read", "- <string> Reads the contents of the filename");
            this.commandList[this.commandList.length] = sc;

            // delete
            sc = new TSOS.ShellCommand(this.ShellDelete, "delete", "- <string> Deletes the file and its contents");
            this.commandList[this.commandList.length] = sc;

            // ls
            sc = new TSOS.ShellCommand(this.ShellLs, "ls", "- <string> List of the Active Files");
            this.commandList[this.commandList.length] = sc;

            // setschedule
            sc = new TSOS.ShellCommand(this.ShellSetSchedule, "setschedule", "- [rr,fcfs,priority] Sets the current schedule.");
            this.commandList[this.commandList.length] = sc;

            // getschedule
            sc = new TSOS.ShellCommand(this.ShellGetSchedule, "getschedule", "- Gets the current schedule");
            this.commandList[this.commandList.length] = sc;

            // processes - list the running processes and their IDs
            // kill <id> - kills the specified process id.
            //
            // Display the initial prompt.
            this.putPrompt();
        };

        Shell.prototype.putPrompt = function () {
            _StdOut.putText(this.promptStr);
        };

        Shell.prototype.handleInput = function (buffer) {
            _Kernel.krnTrace("Shell Command~" + buffer);

            //
            // Parse the input...
            //
            var userCommand = new TSOS.UserCommand();
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
                if (this.curses.indexOf("[" + TSOS.Utils.rot13(cmd) + "]") >= 0) {
                    this.execute(this.shellCurse);
                } else if (this.apologies.indexOf("[" + cmd + "]") >= 0) {
                    this.execute(this.shellApology);
                } else {
                    this.execute(this.shellInvalidCommand);
                }
            }
        };

        // args is an option parameter, ergo the ? which allows TypeScript to understand that
        Shell.prototype.execute = function (fn, args) {
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
        };

        Shell.prototype.parseInput = function (buffer) {
            var retVal = new TSOS.UserCommand();

            // 1. Remove leading and trailing spaces.
            buffer = TSOS.Utils.trim(buffer);

            // 2. Lower-case it.
            buffer = buffer.toLowerCase();

            // 3. Separate on spaces so we can determine the command and command-line args, if any.
            var tempList = buffer.split(" ");

            // 4. Take the first (zeroth) element and use that as the command.
            var cmd = tempList.shift();

            // 4.1 Remove any left-over spaces.
            cmd = TSOS.Utils.trim(cmd);

            // 4.2 Record it in the return value.
            retVal.command = cmd;

            for (var i in tempList) {
                var arg = TSOS.Utils.trim(tempList[i]);
                if (arg != "") {
                    retVal.args[retVal.args.length] = tempList[i];
                }
            }
            return retVal;
        };

        //
        // Shell Command Functions.  Again, not part of Shell() class per se', just called from there.
        //
        Shell.prototype.shellInvalidCommand = function () {
            _StdOut.putText("Invalid Command. ");
            if (_SarcasticMode) {
                _StdOut.putText("Duh. Go back to your Speak & Spell.");
            } else {
                _StdOut.putText("Type 'help' for, well... help.");
            }
        };

        Shell.prototype.shellCurse = function () {
            _StdOut.putText("Oh, so that's how it's going to be, eh? Fine.");
            _StdOut.advanceLine();
            _StdOut.putText("Bitch.");
            _SarcasticMode = true;
        };

        Shell.prototype.shellApology = function () {
            if (_SarcasticMode) {
                _StdOut.putText("Okay. I forgive you. This time.");
                _SarcasticMode = false;
            } else {
                _StdOut.putText("For what?");
            }
        };

        /**
        * Renders the OS Name and Version.
        * @param args
        */
        Shell.prototype.shellVer = function (args) {
            _StdOut.putText(APP_NAME + " version " + APP_VERSION);
        };

        /**
        * Renders the current Date Object.
        */
        Shell.prototype.shellDate = function () {
            _StdOut.putText("" + new Date().toDateString() + " " + new Date().toLocaleTimeString());
        };

        /**
        * Prints PI.
        */
        Shell.prototype.shellSurprise = function () {
            _StdOut.putText("My favorite number is " + Math.PI);
        };

        /**
        * Prints the location.
        */
        Shell.prototype.shellWhereami = function () {
            _StdOut.putText("I'm stuck in a loop....");
        };

        /**
        * Draws a blue screen over the canvas.
        */
        Shell.prototype.shellBSOD = function () {
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_BSOD, "BSOD"));
        };

        /**
        * Loads the user input program if any,
        * and validates HEX (at the moment).
        */
        Shell.prototype.shellLoad = function (args) {
            var f = document.getElementById("taProgramInput").value;
            var x = f.replace(/\s/g, '');

            if (x.length == 0 || x.length % 2 != 0) {
                _StdOut.putText("Invalid Input!");
                return;
            }

            for (var i = 0; i < x.length; i++) {
                var temp = x.charCodeAt(i);

                if ((temp == 32) || (temp >= 65 && temp <= 70) || (temp >= 48 && temp <= 57) || (temp >= 97 && temp <= 102)) {
                    continue;
                } else {
                    _StdOut.putText("FOUND INVALID HEX CHARACTER!");
                    return;
                }
            }

            if (x.toString().length > (_BlockSize * 2)) {
                _StdOut.putText("Too big to fit into the Memory block");
                return;
            }

            //            Get the free block first!
            var base = _MemoryManager.getBlockAvailable();

            if (base != -1) {
                //Create New PCB and don't forget the priority
                if (args.length == 0) {
                    var p = new TSOS.Pcb(base, (base + 255), 0);
                } else {
                    var p = new TSOS.Pcb(base, (base + 255), args);
                }
                p.setLength((x.length / 2)); //set the length of the program.
                p.setState(9999999999999999999999999); //set state "NEW"
                p.setLocation("Memory");
                p.setPrintLocation("Memory");

                //Load in the Resident Queue
                _ResidentQueue.push(p);

                //Push on Fake because Resident Queue expands and shrinks
                //This is also my Terminated Queue!
                _FakeQueue.push(p);

                //Print to Console
                _StdOut.putText("Loaded Successfully!");
                _Console.advanceLine();
                _StdOut.putText("Process ID: " + p.getPid());

                //Finally load into Memory
                _MemoryManager.load(base, x.toUpperCase().toString());
            } else {
                //Base is -1 at this point.
                //so need to swap into the file system.
                //Create New PCB and don't forget the priority > 0
                // (priority > 0 denotes...its in the file system)
                //make a filename first
                var p = new TSOS.Pcb(-1, -1, -1);
                p.setLocation("Disk");
                p.setPrintLocation("Disk");
                p.setState(9999999999999999999999999); //set state "NEW"
                p.setLength((x.length / 2));
                var filename = ("swap" + p.getPid());
                _FileSystem.rollOut(filename, x.toUpperCase().toString());
                _ResidentQueue.push(p);
                _FakeQueue.push(p);
            }
        };

        Shell.prototype.sort = function () {
            for (var i = 0; i < _ResidentQueue.length; i++) {
                for (var j = 0; j < _ResidentQueue.length - i; j++) {
                    if (_ResidentQueue[j - 1].getPriority() < _ResidentQueue[j].getPriority()) {
                        var temp = _ResidentQueue[j - 1];
                        _ResidentQueue[j - 1] = _ResidentQueue[j];
                        _ResidentQueue[j] = temp;
                    }
                }
            }
        };

        Shell.prototype.printList = function () {
            alert("inPrint");
            for (var i = 0; i < _ResidentQueue.length; i++) {
                var p = _ResidentQueue[i];
                alert("P: " + p.getPid());
                _StdOut.putText("" + p.getPid().toString());
                _Console.advanceLine();
            }
        };

        /**
        * Updates the Ready Queue Table
        */
        Shell.updateReadyQueue = function () {
            var tableView = "<table>";
            tableView += "<th>PID</th>";
            tableView += "<th>Base</th>";
            tableView += "<th>Limit</th>";
            tableView += "<th>State</th>";
            tableView += "<th>PC</th>";
            tableView += "<th>IR</th>";
            tableView += "<th>Acc</th>";
            tableView += "<th>XReg</th>";
            tableView += "<th>YReg</th>";
            tableView += "<th>ZReg</th>";
            tableView += "<th>Location</th>";

            for (var i = _FakeQueue.length - 1; i >= 0; i--) {
                var s = _FakeQueue[i];
                if (s.getState() != "New") {
                    if (s.getState() == "Running") {
                        tableView += "<tr style='background-color: limegreen;'>";
                        tableView += "<td>" + s.getPid().toString() + "</td>";
                        tableView += "<td>" + s.getBase().toString() + "</td>";
                        tableView += "<td>" + s.getLimit().toString() + "</td>";
                        tableView += "<td>" + s.getState().toString() + "</td>";
                        tableView += "<td>" + parseInt(s.getPc() + s.getBase()) + "</td>";
                        tableView += "<td>" + s.getIR() + "</td>";
                        tableView += "<td>" + s.getAcc() + "</td>";
                        tableView += "<td>" + s.getX() + "</td>";
                        tableView += "<td>" + s.getY() + "</td>";
                        tableView += "<td>" + s.getZ() + "</td>";
                        tableView += "<td>" + s.getPrintLocation() + "</td>";
                        tableView += "</tr>";
                    }
                    if (s.getState() == "Terminated" || s.getState() == "Killed") {
                        tableView += "<tr style='background-color: red;'>";
                        tableView += "<td>" + s.getPid().toString() + "</td>";
                        tableView += "<td>" + s.getBase().toString() + "</td>";
                        tableView += "<td>" + s.getLimit().toString() + "</td>";
                        tableView += "<td>" + s.getState().toString() + "</td>";
                        tableView += "<td>" + parseInt(s.getPc() + s.getBase()) + "</td>";
                        tableView += "<td>" + s.getIR() + "</td>";
                        tableView += "<td>" + s.getAcc() + "</td>";
                        tableView += "<td>" + s.getX() + "</td>";
                        tableView += "<td>" + s.getY() + "</td>";
                        tableView += "<td>" + s.getZ() + "</td>";
                        tableView += "<td>" + s.getPrintLocation() + "</td>";
                        tableView += "</tr>";
                    }

                    if (s.getState() == "Waiting") {
                        tableView += "<tr style='background-color: #FFD801;'>";
                        tableView += "<td style='color: #000000;'>" + s.getPid().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getBase().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getLimit().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getState().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + parseInt(s.getPc() + s.getBase()) + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getIR() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getAcc() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getX() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getY() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getZ() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getPrintLocation() + "</td>";
                        tableView += "</tr>";
                    }

                    if (s.getState() == "Ready") {
                        tableView += "<tr style='background-color: darkturquoise;'>";
                        tableView += "<td style='color: #000000;'>" + s.getPid().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getBase().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getLimit().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getState().toString() + "</td>";
                        tableView += "<td style='color: #000000;'>" + parseInt(s.getPc() + s.getBase()) + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getIR() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getAcc() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getX() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getY() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getZ() + "</td>";
                        tableView += "<td style='color: #000000;'>" + s.getPrintLocation() + "</td>";
                        tableView += "</tr>";
                    }
                }
            }
            tableView += "</table>";
            document.getElementById("displayReady").innerHTML = tableView;
        };

        /**
        * Changes the status of the system.
        *
        * @param args, the status to change.
        */
        Shell.prototype.shellStatus = function (args) {
            if (args.length > 0) {
                var s = "";

                for (var i = 0; i < args.length; i++) {
                    s += args[i];
                    s += " ";
                }
                document.getElementById("status").innerHTML = "Status: " + s;
            }
        };

        Shell.prototype.shellHelp = function (args) {
            _StdOut.putText("Commands:");
            for (var i in _OsShell.commandList) {
                _StdOut.advanceLine();
                _StdOut.putText("  " + _OsShell.commandList[i].command + " " + _OsShell.commandList[i].description);
            }
        };

        Shell.prototype.shellShutdown = function (args) {
            _StdOut.putText("Shutting down...");

            // Call Kernel shutdown routine.
            _Kernel.krnShutdown();
            // TODO: Stop the final prompt from being displayed.  If possible.  Not a high priority.  (Damn OCD!)
        };

        Shell.prototype.shellCls = function (args) {
            _StdOut.clearScreen();
            _StdOut.resetXY();
        };

        Shell.prototype.shellMan = function (args) {
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
        };

        Shell.prototype.shellTrace = function (args) {
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
        };

        Shell.prototype.shellRot13 = function (args) {
            if (args.length > 0) {
                // Requires Utils.ts for rot13() function.
                _StdOut.putText(args.join(' ') + " = '" + TSOS.Utils.rot13(args.join(' ')) + "'");
            } else {
                _StdOut.putText("Usage: rot13 <string>  Please supply a string.");
            }
        };

        Shell.prototype.shellPrompt = function (args) {
            if (args.length > 0) {
                _OsShell.promptStr = args[0];
            } else {
                _StdOut.putText("Usage: prompt <string>  Please supply a string.");
            }
        };

        /**
        * Sets the current quantum to the argument passed
        * @param args
        */
        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                if (args > 0) {
                    _Quantum = args;
                    _StdOut.putText("Current Quantum: " + _Quantum);
                } else {
                    _Quantum = 6;
                    _StdOut.putText("Bitch Please....give me Quantum >" + _Quantum);
                    _Console.advanceLine();
                    _StdOut.putText("Current Quantum: " + _Quantum);
                }
            } else {
                _StdOut.putText("pasarme la perra quamtum");
            }
        };

        /**
        * Shows the PID of active Processes.
        */
        Shell.prototype.shellPs = function () {
            var nobueno = false;

            for (var i = 0; i < _FakeQueue.length; i++) {
                var temp = _FakeQueue[i];
                if (temp.getState() == "Running" || temp.getState() == "Waiting") {
                    nobueno = true;
                    if (i + 1 == _FakeQueue.length) {
                        _StdOut.putText("Pid: " + temp.getPid());
                    } else {
                        _StdOut.putText("PID: " + temp.getPid() + ", ");
                    }
                }
            }

            if (nobueno == false) {
                _StdOut.putText("noo procesos en ejecución !");
            }
        };

        /**
        * Clears Memory Partitions
        */
        Shell.prototype.shellClearMem = function () {
            _MemoryManager.clearMemory();
        };

        /**
        *
        * @param args
        */
        Shell.prototype.shellKill = function (args) {
            //what if only thing running...we want to reset the CPU
            if ((_CurrentProcess.getPid() == args) && (_CurrentProcess.getState() == "Running") && (_ReadyQueue.isEmpty())) {
                _Kernel.krnInterruptHandler(_KilledReset, _CurrentProcess);
                return;
            }

            //set the current process to killed...and go to next process
            if ((_CurrentProcess.getPid() == args) && (_CurrentProcess.getState() == "Running")) {
                _Kernel.krnInterruptHandler(_KilledRunAll, _CurrentProcess);
                return;
            }

            for (var i = 0; i < _ReadyQueue.getSize(); i++) {
                var process = _ReadyQueue.q[i];

                if (process.getPid() == args && (process.getState() == "Terminated" || process.getState() == "Killed")) {
                    _StdOut.putText("I'm already dead......Why are you so mean....?");
                    return;
                }

                if (process.getState() != "Terminated") {
                    if (process.getPid() == args) {
                        process.setState(5);
                        _StdOut.putText("Killed PID: " + process.getPid());
                        _Kernel.krnInterruptHandler(_Killed, process);
                        return;
                    }
                }
            }
            _StdOut.putText("Why do you wanna KILL me....?");
        };

        /**
        * Run a single program
        * @param args
        */
        Shell.prototype.shellRun = function (args) {
            if (args.length == 0 || args < 0) {
                _StdOut.putText("Load this Bitch again and RUN...!");
            } else if (_StepButton) {
                _StdOut.putText("Single Step is on!");
            } else if (_ResidentQueue[args].getState() == "New") {
                _ResidentQueue[args].setState(3); //only put what's NEW!
                _Kernel.krnInterruptHandler(_RUN, _ResidentQueue[args]);
            }
        };

        /**
        * Invokes the RUNALL case in the Kernel Interrupt Handler
        */
        Shell.prototype.shellRunAll = function () {
            for (var i = 0; i < _ResidentQueue.length; i++) {
                if (_ResidentQueue[i].getState() == "New")
                    _ResidentQueue[i].setState(3);
                _ReadyQueue.enqueue(_ResidentQueue[i]);
            }
            _KernelInterruptQueue.enqueue(new TSOS.Interrupt(_SCHEDULE, 0));
        };

        /**
        * Formats the FIle System.
        */
        Shell.prototype.ShellFormat = function () {
            _FileSystem.format();
            _StdOut.putText("File System Formatted!");
        };

        /**
        * Creates a file name in the file system
        * @param args
        * @constructor
        */
        Shell.prototype.ShellCreate = function (args) {
            _FileSystem.createFile(args.toString());
        };

        /**
        *
        * @param filename
        * @param filecontents
        * @constructor
        */
        Shell.prototype.ShellWrite = function (data) {
            var filename = data[0];
            var firstArg = data[1];
            var lastArg = data[data.length - 1];
            var firstChar = firstArg.charAt(0);
            var lastChar = lastArg.charAt(lastArg.length - 1);
            var firstAscii = firstChar.charCodeAt(0);
            var lastAscii = lastChar.charCodeAt(lastChar.length - 1);
            var load = "";

            if (data.length == 2) {
                if ((firstChar == lastChar) && (firstAscii == 34) && (lastAscii == 34)) {
                    load += data[1].slice(1, (data[1].length - 1));
                    _FileSystem.writeToFile(filename, load, true);
                    return;
                } else {
                    _StdOut.putText("File Contents must be between: \" \"");
                }
            }

            if (data.length > 2) {
                if ((firstChar == lastChar) && (firstAscii == 34) && (lastAscii == 34)) {
                    //ready to write...
                    alert("In loop");
                    load += data[1].slice(1, data[1].length) + " ";
                    load += " ";
                    for (var i = 2; i < data.length; i++) {
                        if ((i + 1) == data.length) {
                            load += lastArg.slice(0, data[i].length - 1);
                            break;
                        }
                        load += data[i];
                        load += " ";
                    }
                    _FileSystem.writeToFile(filename, load, true);
                } else {
                    _StdOut.putText("File Contents must be between: \" \"");
                }
            }
            //            var lastChar = data[data.length-1].charAt(data[data.length-1].char)
            //            var count:number = 0;
            //
            //            for(var i=0; i<contents.length;i++){
            //                if(contents.charCodeAt(i) == 34){
            //                    count ++;
            //                }
            //            }
            //            var first:string = contents.slice(0,1);
            //            var last:string = contents.slice(contents.length-1,contents.length);
            //            if(count == 2 && (first == last)){
            //                var fileContents = data[1].slice(1,data[1].length-1);
            //                _FileSystem.writeToFile(data[0],fileContents);
            //            }else {
            //                _StdOut.putText("Please provide file contents between \" \"");
            //            }
        };

        /**
        * Reads the contents of the filename
        * @param filename
        * @constructor
        */
        Shell.prototype.ShellRead = function (filename) {
            _FileSystem.read(filename);
        };

        /**
        * List of the active files.
        * @constructor
        */
        Shell.prototype.ShellLs = function () {
            _FileSystem.fileDirectory();
        };

        Shell.prototype.ShellDelete = function (filename) {
            _FileSystem.deleteFile(filename);
        };

        /**
        * Sets the current schedule
        * @param schedule
        * @constructor
        */
        Shell.prototype.ShellSetSchedule = function (schedule) {
            if (schedule == "rr" || schedule == "fcfs" || schedule == "priority") {
                _CurrentSchedule = schedule;
                _StdOut.putText("Current Schedule is set to: " + _CurrentSchedule);
            } else {
                _StdOut.putText("Invalid Schedule type!");
            }
        };

        /**
        * Gets the current schedule
        * @constructor
        */
        Shell.prototype.ShellGetSchedule = function () {
            _StdOut.putText("Current Schedule is: " + _CurrentSchedule);
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
