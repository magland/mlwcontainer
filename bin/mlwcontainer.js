#!/usr/bin/env nodejs

var common=require(__dirname+'/mlw_common.js');

var CLP=new common.CLParams(process.argv);

var all_processes=[];
process.on('SIGTERM', cleanup);
process.on('SIGINT', cleanup);
function cleanup() {
	for (var i in all_processes) {
		all_processes[i].kill('SIGINT');
		//process.kill(-all_processes[i].pid);
	}
	process.exit();
}

var config={};
var fname=CLP.unnamedParameters.join(' '); //in case there are spaces in the file name
if (common.ends_with(fname,'.mlwc')) {
	var txt=common.read_text_file(fname);
	if (!txt) {
		console.error('Unable to read file: '+fname);
		process.exit(-1);
		return;
	}
	var obj=common.try_parse_json(txt);
	if (!obj) {
		console.error('Unable to read file: '+fname);
		process.exit(-1);
		return;	
	}
	for (var key in obj) {
		config[key]=obj[key];
	}
}

for (var key in CLP.namedParameters) {
	config[key]=CLP.namedParameters[key];
}

var docstor_url=config['docstor_url']||'https://docstor1.herokuapp.com';
var mlw_document_id=config['mlw_document_id']||'';
var mlw_access_token=config['mlw_access_token']||'';
var port=config['port']||'';
var show_in_browser=config['show_in_browser']||'true';

if (!mlw_document_id) {
	console.error('Missing config parameter: mlw_document_id');
	process.exit(-1);
	return;
}

process.env.DOCSTOR_URL=docstor_url;
process.env.MLW_DOCUMENT_ID=mlw_document_id;
process.env.MLW_ACCESS_TOKEN=mlw_access_token;
process.env.PORT=port;
process.env.SHOW_IN_BROWSER=show_in_browser;

console.log ("Building and running docker...");
var P=run_process(__dirname+'/mlw_start_docker',[],function(err,stdout,return_code) {
	if (err) {
		console.error('Error in mlw_start_docker: '+err);
		return;
	}
	if (return_code!==0) {
		console.error('Non-zero return code in mlw_start_docker: '+return_code);
		return;	
	}
});
if (P) all_processes.push(P);

function run_process(exe,args,callback) {
	//console.log ('RUNNING:'+exe+' '+args.join(' '));
	var P;
	try {
		//var opts={stdio: 'inherit',detached:true};
		//var opts={detached:true};
		var opts={};
		P=require('child_process').spawn(exe,args,opts);
	}
	catch(err) {
		console.error(err);
		callback("Problem launching: "+exe+" "+args.join(" "),'',-1);
		return;
	}
	var txt='';
	P.stdout.on('data',function(chunk) {
		txt+=chunk;
		process.stdout.write(''+chunk);

		// The following is a terrible hack. We'll need to replace it with something better later.
		// When user closes browser tab we often get message "Starting buffering for"
		// So this closes the session in that circumstance
		var ind=txt.indexOf('Starting buffering for');
		if (ind>=0) {
			console.log ('Log output included "Started buffering for", so we are closing the server.');
			P.kill('SIGINT');
		}
	});
	P.stderr.on('data',function(chunk) {
		txt+=chunk;
		process.stdout.write(''+chunk);
	});
	P.on('close',function(code) {
		callback('',txt,code);
	});
	return P;
}
