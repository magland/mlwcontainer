#!/usr/bin/env nodejs

var common=require(__dirname+'/mlw_common.js');

var CLP=new common.CLParams(process.argv);

var document_fname=CLP.namedParameters['doc'];
if (!document_fname) {
	console.error('Missing command-line parameter: doc');
	process.exit(-1);
	return;
}

var destpath=CLP.namedParameters['destpath'];
if (!destpath) {
	console.error('Missing command-line parameter: destpath');
	process.exit(-1);
	return;
}

var txt=common.read_text_file(document_fname);
if (!txt) {
	console.error('Unable to read file: '+document_fname);
	process.exit(-1);
}
var workspace=common.try_parse_json(txt);
if (!workspace) {
	console.error('Error parsing json of file: '+document_fname);
	process.exit(-1);	
}

workspace.files=workspace.files||{};

for (var fname in workspace.files) {
	var path0=destpath+'/'+fname;
	console.log ('Writing '+path0);
	if (!common.write_text_file(path0,workspace.files[fname].content)) {
		console.error('Unable to write file: '+path0);
		return;
	}
}
