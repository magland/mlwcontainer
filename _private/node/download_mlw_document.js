#!/usr/bin/env nodejs

var request = require('request');
var common=require(__dirname+'/mlw_common.js');

var CLP=new common.CLParams(process.argv);

var document_fname=CLP.namedParameters['doc'];
if (!document_fname) {
	console.error('Missing command-line parameter: doc');
	process.exit(-1);
	return;
}

var url=process.env.DOCSTOR_URL+`/api/getDocument?id=${process.env.MLW_DOCUMENT_ID}&include_content=true&access_token=${process.env.MLW_ACCESS_TOKEN}`;
console.log (url);
request(url, function (error, response, body) {
	if (error) {
		console.error('Error: '+error);
		process.exit(-1);
		return;
	}
	if (response.statusCode!=200) {
		console.error('Error: status code is not 200: '+response.statusCode);
		process.exit(-1);
		return;
	}
	var obj=common.try_parse_json(body);
	if (!obj) {
		console.error('Error parsing json in response');
		process.exit(-1);
		return;	
	}
	if (!obj.success) {
		console.error('Error downloading mlw document: '+obj.error);
		process.exit(-1);
		return;
	}
	var workspace=common.try_parse_json(obj.content);
	if (!workspace) {
		console.log (obj.content);
		console.error('Error parsing json of document content.');
		process.exit(-1);
		return;		
	}
	common.write_text_file(document_fname,JSON.stringify(workspace,null,4));
	/*
	for (var fname in workspace.files) {
		var path0=destpath+'/'+fname;
		console.log ('Writing '+path0);
		if (!common.write_text_file(path0,workspace.files[fname].content)) {
			console.error('Unable to write file: '+path0);
			return;
		}
	}
	*/
});

