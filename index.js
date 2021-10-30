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
		
		const name = core.getInput('name');
        const proj = core.getInput('projects');
		
		const projects = proj.split(',');

        // output infos
        console.log('name: ', name);
        console.log('projects: ', projects);

        var prjs = [];
		for (const prj of projects) { 
			let p = {
				"name" : path.basename(prj.trim()).split('.').slice(0, -1).join('.'),
				"path" : prj.trim(),
				"type" : "",
				"id" : uuid.v4()
			}
			prjs.push(p); 
		}





        
		let writer = fs.createWriteStream(name + '.sln');
		writer.write('Microsoft Visual Studio Solution File, Format Version 12.00' + eol);

		for (const prj of projects) { 
			writer.write(`Project("${prjTypeCore}") = "${prj.trim()}", "${prj.trim()}", "${uuid.v4()}"` + eol);
			writer.write('EndProject' + eol);
		}

        for (const p of prjs) { 
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