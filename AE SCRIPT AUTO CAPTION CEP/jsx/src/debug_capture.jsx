// debug_capture.jsx – run inside After Effects
// ------------------------------------------------------
// This script reads the hard‑coded SRT below, runs the existing
// Caption Styler pipeline up to the point where text layers are
// created, and writes detailed logs to a folder called "debug"
// next to this script.

// ----- CONFIG ------------------------------------------------
var srtText = "1\n00:00:00,000 --> 00:00:01,459\nEverybody talks about\n\n2\n00:00:01,459 --> 00:00:01,860\nDubai,\n\n3\n00:00:02,299 --> 00:00:02,779\nbut some of\n\n4\n00:00:02,779 --> 00:00:04,459\nthe smartest international\n\n5\n00:00:04,459 --> 00:00:05,960\nentrepreneurs are choosing\n\n6\n00:00:05,960 --> 00:00:07,099\nHong Kong instead.\n\n7\n00:00:07,339 --> 00:00:07,919\nNow don't get\n\n8\n00:00:07,919 --> 00:00:08,500\nme wrong,\n\n9\n00:00:08,779 --> 00:00:09,500\nDubai is an\n\n10\n00:00:09,500 --> 00:00:10,640\nincredible place to\n\n11\n00:00:10,640 --> 00:00:11,300\ndo business.\n\n12\n00:00:11,720 --> 00:00:12,320\nIt's modern,\n\n13\n00:00:12,539 --> 00:00:13,560\nfast -growing and\n\n14\n00:00:13,560 --> 00:00:14,699\nattracts talent from\n\n15\n00:00:14,699 --> 00:00:15,380\nall over the\n\n16\n00:00:15,380 --> 00:00:15,380\nworld.";

var wordsPerMode = "3"; // use the default 3‑word mode
var layoutMode = "Stacked Anchor"; // any layout – we only need bounds
var animationMode = "None"; // animation disabled

// ----- HELPERS ------------------------------------------------
function writeLog(filePath, content) {
    var f = new File(filePath);
    f.open("a"); // append
    f.writeln(content);
    f.close();
}

function ensureFolder(folderPath) {
    var f = new Folder(folderPath);
    if (!f.exists) f.create();
    return f;
}

// ----- SETUP --------------------------------------------------
var comp = app.project.activeItem;
if (!(comp && comp instanceof CompItem)) {
    alert("Please select a composition before running the debug script.");
    throw new Error("No active composition");
}

var scriptFolder = new File($.fileName).parent;
var debugFolder = ensureFolder(scriptFolder.fsName + "/debug");

var parseLog   = debugFolder.fsName + "/debug_srt_parse.txt";
var chunkLog   = debugFolder.fsName + "/debug_chunks.txt";
var layerLog   = debugFolder.fsName + "/debug_layer_timing.txt";
var layoutLog  = debugFolder.fsName + "/debug_layout.txt";
var crashLog   = debugFolder.fsName + "/debug_crash.txt";

// Clear previous logs
[parseLog, chunkLog, layerLog, layoutLog, crashLog].forEach(function(p){ var f = new File(p); if(f.exists) f.remove(); });

// ----- STEP 1: PARSE SRT -------------------------------------
var captions = CS.SRTParser.parse(srtText);
for (var i = 0; i < captions.length; i++) {
    var c = captions[i];
    writeLog(parseLog, [c.index, c.start.toFixed(3), c.end.toFixed(3), c.text].join(" | "));
}

// ----- STEP 2: CHUNKING --------------------------------------
for (var i = 0; i < captions.length; i++) {
    var cap = captions[i];
    var chunks = CS.SRTParser.chunkCaption(cap, wordsPerMode);
    for (var j = 0; j < chunks.length; j++) {
        var ch = chunks[j];
        var dur = (ch.end - ch.start).toFixed(3);
        writeLog(chunkLog, [i+1, j+1, ch.text, ch.start.toFixed(3), ch.end.toFixed(3), dur].join(" | "));
    }
}

// ----- STEP 3: CREATE LAYERS & LOG TIMING --------------------
// We will only process the first 5 captions to keep the test short.
var maxCaptions = Math.min(5, captions.length);
for (var i = 0; i < maxCaptions; i++) {
    var cap = captions[i];
    var chunks = CS.SRTParser.chunkCaption(cap, wordsPerMode);
    for (var j = 0; j < chunks.length; j++) {
        var ch = chunks[j];
        try {
            // Create a simple text layer (no role split) – just to get bounds.
            var layer = comp.layers.addText(ch.text);
            layer.name = "Dbg_Cap" + (i+1) + "_Chunk" + (j+1);
            // Assign timing – this is the exact logic used by the original renderer.
            layer.startTime = 0;
            layer.inPoint = ch.start;
            layer.outPoint = ch.end;
            writeLog(layerLog, [layer.name, layer.inPoint.toFixed(3), layer.outPoint.toFixed(3)].join(" | "));

            // Measure bounds (real pixel bounds) – this is the heavy call we want to track.
            var bounds = layer.sourceRectAtTime(Math.max(0, layer.inPoint + 0.001), false);
            writeLog(layoutLog, [layer.name, bounds.left, bounds.top, bounds.width, bounds.height].join(", "));
        } catch (e) {
            writeLog(crashLog, "Error at caption " + (i+1) + ", chunk " + (j+1) + " – " + e.toString());
            // Stop further processing – we want to know where the crash happens.
            break;
        }
    }
}

alert("Debug capture complete. Logs are in the " + debugFolder.fsName + " folder.");
