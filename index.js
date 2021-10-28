const core = require('@actions/core'),
      path = require('path'),
	  fs = require('fs');

async function run() {
    try {

		const eol = "\r\n";	
		const name = core.getInput('name');
        const projects = core.getInput('projects');

        // output infos
        console.log('name: ', name);
        console.log('projects: ', projects);

        
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