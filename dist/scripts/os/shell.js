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
            _Console.currentXPosition = 0;
            _Console.currentYPosition = 0;
            var image = new Image();
            image.src = "dist/images/bsod.jpg";
            _DrawingContext.clearRect(0, 0, 500, 500);
            _DrawingContext.drawImage(image, 0, 0, 500, 500);
            _Kernel.krnShutdown();
        };

        /**
        * Loads the user input program if any,
        * and validates HEX (at the moment).
        *
        */
        Shell.prototype.shellLoad = function () {
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

            //            Get the free block first!
            var base = _MemoryManager.getFreeBlock();

            if (base == -1)
                return;

            //Create New PCB
            _Pcb = new TSOS.Pcb(base, (base + 256) - 1); //Memory Size is 256...so base and limit works (for now)!
            _Pcb.setLength((x.length / 2)); //set the length of the program.
            _Pcb.setState(0); //set state "NEW"

            //Load in the Resident Queue
            _ResidentQueue[_Pcb.getPid()] = _Pcb;
            var temp = _ResidentQueue[_Pcb.getPid()];
            alert("Pid: " + temp.getPid() + ", Resident length: " + _ResidentQueue.length);

            //Print to Console
            _StdOut.putText("Loaded Successfully!");
            _Console.advanceLine();
            _StdOut.putText("Process ID: " + _Pcb.getPid());

            //Finally load into Memory
            _MemoryManager.load(base, x.toUpperCase().toString());
            var tableView = "<table>";
            for (var i = 0; i < _ResidentQueue.length; i++) {
                alert("index: " + i);
                var s = _ResidentQueue[i];
                tableView += "<tr>";
                tableView += "<td>" + s.getPid() + "</td>";
                tableView += "<td>" + s.getBase().toString() + "</td>";
                tableView += "<td>" + s.getLimit().toString() + "</td>";

                //                tableView += "<td>" +0+ temp.getState()+ "</td>";
                //                tableView += "<td>" +0+ temp.getPc()+ "</td>";
                //                tableView += "<td>" +0+ temp.getIr()+ "</td>";
                //                tableView += "<td>" +0+ temp.getAcc()+ "</td>";
                //                tableView += "<td>" +0+ temp.getX()+ "</td>";
                //                tableView += "<td>" +0+ temp.getY()+ "</td>";
                //                tableView += "<td>" +0+ temp.getZ()+ "</td>";
                tableView += "</tr>";
            }
            tableView += "</table>";
            document.getElementById("displayResident").innerHTML = tableView;
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

        Shell.prototype.shellQuantum = function (args) {
            if (args.length > 0) {
                if (args[0] > 0) {
                    _Quantum = args[0];
                    _StdOut.putText("Quantum: " + _Quantum);
                } else {
                    _StdOut.putText("WTF?");
                }
            } else {
                _StdOut.putText("???");
            }
        };

        Shell.prototype.shellPs = function () {
            for (var i = 0; i < _ResidentQueue.length; i++) {
                var temp = _ResidentQueue[i];
                alert("pid: " + temp.getPid() + ", state: " + temp.getState());
                if (temp.getState() != "Terminated") {
                    _StdOut.putText("Pid: " + temp.getPid());
                    _Console.advanceLine();
                }
            }
        };

        /**
        * Clears Memory Partitions
        */
        Shell.prototype.shellClearMem = function () {
            _StdOut.putText("Memory Wiped!");
            _MemoryManager.clearMemory();
        };

        /**
        * Run a single program
        * @param args
        */
        Shell.prototype.shellRun = function (args) {
            if (_StepButton) {
                //                args[0].setState(1);
                _StdOut.putText("Single Step is on!");
                return;
            }
            _CurrentProcess = _ResidentQueue[args[0]];
            alert("current process " + _CurrentProcess.getPid());
            _ReadyQueue.enqueue(_ResidentQueue[args[0]]);
        };
        return Shell;
    })();
    TSOS.Shell = Shell;
})(TSOS || (TSOS = {}));
