/* ------------
Globals.ts
Global CONSTANTS and _Variables.
(Global over both the OS and Hardware Simulation / Host.)
This code references page numbers in the text book:
Operating System Concepts 8th edition by Silberschatz, Galvin, and Gagne.  ISBN 978-0-470-12872-5
------------ */
//
// Global "CONSTANTS" (There is currently no const or final or readonly type annotation in TypeScript.)
// TODO: Make a global object and use that instead of the "_" naming convention in the global namespace.
//
var APP_NAME = "BAD ASS OS";
var APP_VERSION = "9.1.5";

var CPU_CLOCK_INTERVAL = 100;

var TIMER_IRQ = 0;

// NOTE: The timer is different from hardware/host clock pulses. Don't confuse these.
var KEYBOARD_IRQ = 100;

//Color for the Logger!
var _FancyColor = 0;

//
// Global Variables
//
var _CPU;

var _OSclock = 0;

var _Mode = 0;

var _Canvas = null;
var _DrawingContext = null;
var _DefaultFontFamily = "sans";
var _DefaultFontSize = 13;
var _FontHeightMargin = 4;

var _Trace = true;

// The OS Kernel and its queues.
var _Kernel;
var _KernelInterruptQueue = null;
var _KernelBuffers = null;
var _KernelInputQueue = null;

// Standard input and output
var _StdIn = null;
var _StdOut = null;

// UI
var _Console;
var _OsShell;

// At least this OS is not trying to kill you. (Yet.)
var _SarcasticMode = false;

// Global Device Driver Objects - page 12
var _krnKeyboardDriver = null;

var _hardwareClockID = null;

// For testing...
var _GLaDOS = null;
var Glados = null;

// MEMORY INFO
var _MainMemory = null;
var _MainMemorySize = 768;
var _MainMemoryBase = null;
var _Memory;
var _MemoryPartitions = 3;
var _BlockSize = 256;
var _MemoryErrr = 123;
var _Inuse = false;

//Memory Manager
var _MemoryManager;

//PCB
var _Pcb;

//Ready and Resident Queues
var _ResidentQueue = null;
var _ReadyQueue;
var _CurrentProcess;
var _RUN = -5;
var _ClockCycle = 0;

var _ResidentDisplay = null;

//history of commands
var _ConsoleHistory = null;

//step button to control the stepping
var _StepButton = false;
var _NextButton = false;

//Op Code to break
var _Break = -1;

//System Call
var _SystemCall = 9;
var _InvalidOpCode = 999;

// CPU Scheduling
var _Quantum = 6;
var _CurrentScheduler;

var _Time = new Date().getMilliseconds();

var onDocumentLoad = function () {
    TSOS.Control.hostInit();
};
