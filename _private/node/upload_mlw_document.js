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

var txt=common.read_text_file(document_fname);
if (!txt) {
	console.error('Error reading text file: '+document_fname);
	process.exit(-1);
	return;
}
var workspace=common.try_parse_json(txt);
if (!workspace) {
	console.error('Error parsing json from file: '+document_fname);
	process.exit(-1);
	return;
}

var url=process.env.DOCSTOR_URL+`/api/setDocument?id=${process.env.MLW_DOCUMENT_ID}&access_token=${process.env.MLW_ACCESS_TOKEN}`;
console.log (url);
var data0={content:JSON.stringify(workspace)};
request.post({url:url,body:JSON.stringify(data0)}, function (error, response, body) {
	if (error) {
		console.error('Error posting data: '+error);
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
		console.error('Error uploading mlw document: '+obj.error);
		process.exit(-1);
		return;
	}
});

