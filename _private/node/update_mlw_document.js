#!/usr/bin/env nodejs

var common=require(__dirname+'/mlw_common.js');

var CLP=new common.CLParams(process.argv);

var document_fname=CLP.namedParameters['doc'];
if (!document_fname) {
	console.error('Missing command-line parameter: doc');
	process.exit(-1);
	return;
}

var srcpath=CLP.namedParameters['srcpath'];
if (!srcpath) {
	console.error('Missing command-line parameter: srcpath');
	process.exit(-1);
	return;
}

var txt=common.read_text_file(document_fname);
if (!txt) {
	console.error('Unable to read file: '+document_fname);
	process.exit(-1);
	return;
}
var workspace=common.try_parse_json(txt);
if (!workspace) {
	console.error('Error parsing json of file: '+document_fname);
	process.exit(-1);	
	return;
}

if (!('files' in workspace)) {
	console.error('Field not found in workspace document: files');
	process.exit(-1);		
	return;
}

var something_changed=false;
for (var fname in workspace.files) {
	var path0=srcpath+'/'+fname;
	console.log ('Reading '+path0);
	var txt=common.read_text_file(path0);
	if (!txt) {
		console.error('Unable to read file: '+path0);
		process.exit(-1);
		return;
	}
	if (workspace.files[fname].content!=txt) {
		workspace.files[fname].content=txt;
		console.log('File contents changed: '+fname);
		something_changed=true;
	}
}

if (something_changed) {
	console.log('Writing changes...');
	if (!common.write_text_file(document_fname,JSON.stringify(workspace,null,4))) {
		console.error('Unable to write file: '+document_fname);
		process.exit(-1);
		return;
	}
}
else {
	console.log ('Nothing changed.');
}
