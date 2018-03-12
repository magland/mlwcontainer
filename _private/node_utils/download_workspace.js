#!/usr/bin/env nodejs

var request = require('request');

var CLP=new CLParams(process.argv);

var url=CLP.namedParameters['workspace_url'];
if (!url) {
	console.error('Missing command-line parameter: workspace_url');
	return;
}

var destpath=CLP.namedParameters['destpath'];
if (!destpath) {
	console.error('Missing command-line parameter: destpath');
	return;
}

request(url, function (error, response, body) {
	if (error) {
		console.error('Error: '+error);
		return;
	}
	if (response.statusCode!=200) {
		console.error('Error: status code is not 200: '+response.statusCode);
		return;
	}
	var obj=try_parse_json(body);
	if (!obj) {
		console.error('Error parsing json in response');
		return;	
	}
	var workspace=try_parse_json(obj.content);
	if (!workspace) {
		console.error('Error parsing json of document content.');
		return;		
	}
	for (var fname in workspace.files) {
		var path0=destpath+'/'+fname;
		console.log ('Writing '+path0);
		if (!write_text_file(path0,workspace.files[fname].content)) {
			console.error('Unable to write file: '+path0);
			return;
		}
	}
});

function try_parse_json(json) {
	try {
		return JSON.parse(json);
	}
	catch(err) {
		return null;
	}
}

function CLParams(argv) {
	this.unnamedParameters=[];
	this.namedParameters={};

	var args=argv.slice(2);
	for (var i=0; i<args.length; i++) {
		var arg0=args[i];
		if (arg0.indexOf('--')===0) {
			arg0=arg0.slice(2);
			var ind=arg0.indexOf('=');
			if (ind>=0) {
				this.namedParameters[arg0.slice(0,ind)]=arg0.slice(ind+1);
			}
			else {
				//this.namedParameters[arg0]=args[i+1]||'';
				//i++;
				this.namedParameters[arg0]='';
			}
		}
		else if (arg0.indexOf('-')===0) {
			arg0=arg0.slice(1);
			this.namedParameters[arg0]='';
		}
		else {
			this.unnamedParameters.push(arg0);
		}
	}
};

function write_text_file(fname,txt) {
	try {
		require('fs').writeFileSync(fname,txt);
		return true;
	}
	catch(err) {
		return false;
	}
}
