const core = require('@actions/core'),
      exec = require('@actions/exec'),
      tool = require('@actions/tool-cache'),
      path = require('path'),
	  fs = require('fs');

async function run() {
    try {

		const eol = "\r\n";	
		const name = core.getInput('name');
        const version = core.getInput('version');
        const projects = core.getInput('projects');
        
		const instFolder = path.join(home, 'InstallResources');

        // output infos
        console.log('Install SHFB Version: ', version);
        console.log('Download: ', toolUrl);

        
		let writer = fs.createWriteStream(name + '.sln');
		writer.write('Microsoft Visual Studio Solution File, Format Version 12.00'  + eol);

		writer.write('Global'  + eol);

		
		writer.write('EndGlobal'  + eol);



		//writer.write(`xxx ${name}`);


		writer.end();

    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();