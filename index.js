const core = require('@actions/core'),
	  uuid = require('uuid'),
      path = require('path'),
	  fs = require('fs');

async function run() {
    try {

		const eol = "\r\n";	
		
		const prjTypeFolder = "{2150E333-8FDC-42A3-9474-1A3956D46DE8}";
		const prjTypeFwk = "{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}";
		const prjTypeCore = "{9A19103F-16F7-4668-BE54-9A1E7A4F7556}";
		const prjTypeShare = "{D954291E-2A0B-460D-934E-DC6B0785DB48}";
		
		const solutionName = core.getInput('name');
        const solutionProjects = core.getInput('projects').split(',').map(p => p.trim());
        const solutionConfigs = core.getInput('configurations').split(',').map(p => p.trim());
		
        // output infos
        console.log('name: ', solutionName);
        console.log('projects: ', solutionProjects);

        var projects = [];
		for (const solutionProject of solutionProjects) { 
			let p = {
				"name" : path.basename(solutionProject).split('.').slice(0, -1).join('.'),
				"path" : solutionProject,
				"type" : "",
				"id" : uuid.v4()
			}
			projects.push(p); 
		}


        
		let writer = fs.createWriteStream(solutionName + '.sln');
		writer.write('Microsoft Visual Studio Solution File, Format Version 12.00' + eol);

        for (const p of projects) { 
			writer.write(`Project("${p.type}") = "${p.name}", "${p.path}", "${p.id}"` + eol);
			writer.write('EndProject' + eol);
		}
		
		writer.write('Global' + eol);
		writer.write('    GlobalSection(SolutionConfigurationPlatforms) = preSolution' + eol);
		writer.write('        Debug|Any CPU = Debug|Any CPU' + eol);
		writer.write('        Release|Any CPU = Release|Any CPU' + eol);
		writer.write('    EndGlobalSection' + eol);
		writer.write('    GlobalSection(ProjectConfigurationPlatforms) = postSolution' + eol);
		writer.write('        {53B2BD56-77F4-4E85-B53F-C07CCD842BD7}.Debug|Any CPU.ActiveCfg = Debug|Any CPU' + eol);
		writer.write('        {53B2BD56-77F4-4E85-B53F-C07CCD842BD7}.Debug|Any CPU.Build.0 = Debug|Any CPU' + eol);
		writer.write('        {53B2BD56-77F4-4E85-B53F-C07CCD842BD7}.Release|Any CPU.ActiveCfg = Release|Any CPU' + eol);
		writer.write('        {53B2BD56-77F4-4E85-B53F-C07CCD842BD7}.Release|Any CPU.Build.0 = Release|Any CPU' + eol);
		writer.write('    EndGlobalSection' + eol);
		writer.write('    GlobalSection(SolutionProperties) = preSolution' + eol);
		writer.write('        HideSolutionNode = FALSE' + eol);
		writer.write('    EndGlobalSection' + eol);
		writer.write('    GlobalSection(ExtensibilityGlobals) = postSolution' + eol);
		writer.write('        SolutionGuid = {BB157E78-9E24-4CC2-98B9-FA3D414F9318}' + eol);
		writer.write('    EndGlobalSection' + eol);
		writer.write('EndGlobal' + eol);



		//writer.write(`xxx ${name}`);


		writer.end();

    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();