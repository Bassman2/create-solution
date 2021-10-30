const core = require('@actions/core'),
	  uuid = require('uuid'),
      path = require('path'),
	  fs = require('fs');

async function run() {
    try {

		const eol = "\r\n";	
		
		const PrjType = {
			Folder: 1,
			Framework: 2,
			Core: 3,
			Share: 4
		};
		
		const prjUuidFolder = "{2150E333-8FDC-42A3-9474-1A3956D46DE8}";
		const prjUuidFwk = "{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}";
		const prjUuidCore = "{9A19103F-16F7-4668-BE54-9A1E7A4F7556}";
		const prjUuidShare = "{D954291E-2A0B-460D-934E-DC6B0785DB48}";
		
		const solutionName = core.getInput('name');
        const solutionProjects = core.getInput('projects').split(',').map(p => p.trim());
        const solutionConfigs = core.getInput('configurations').split(',').map(p => p.trim());
		
        // output infos
        console.log('name: ', solutionName);
        console.log('projects: ', solutionProjects);
        console.log('configurations: ', solutionConfigs);

        var projects = [];
		for (const solutionProject of solutionProjects) { 
			var ext = path.extname(solutionProject);
			var prjType = PrjType.Folder
			var prjUuid = '';
			switch (ext) {
				case '.shproj':
					prjType = PrjType.Share;
					prjUuid = prjUuidShare;
					break;
				case '.csproj':
					if (IfFileStartsWith(solutionProject, '<Project')) {
						prjType = PrjType.Core;
						prjUuid = prjUuidCore;
					} else {
						prjType = PrjType.Framework;
						prjUuid = prjUuidFwk;						
					}
					break;
				case '':
					prjType = PrjType.Folder;
					prjUuid = prjUuidFolder
					break;
				default:
					core.setFailed(`${ext} not defined`);
					break;
			}
					
		
			let p = {
				"type" : prjType,
				"typeid" : prjUuid,
				"name" : path.basename(solutionProject).split('.').slice(0, -1).join('.'),
				"path" : solutionProject,
				"prjid" : `{${uuid.v4()}}`
			}
			projects.push(p); 
		}


        
		let writer = fs.createWriteStream(solutionName + '.sln');
		writer.write('Microsoft Visual Studio Solution File, Format Version 12.00' + eol);

        for (const p of projects) { 
			writer.write(`Project("${p.typeid}") = "${p.name}", "${p.path}", "${p.prjid}"` + eol);
			writer.write('EndProject' + eol);
		}
		
		writer.write('Global' + eol);
		writer.write('    GlobalSection(SolutionConfigurationPlatforms) = preSolution' + eol);
		for (const c of solutionConfigs) {
			writer.write(`        ${c} = ${c}` + eol);
		}
		writer.write('    EndGlobalSection' + eol);

		writer.write('    GlobalSection(ProjectConfigurationPlatforms) = postSolution' + eol);
		for (const p of projects) {
			for (const c of solutionConfigs) {
				writer.write(`        ${p.prjid}.${c}.ActiveCfg = ${c}` + eol);
				writer.write(`        ${p.prjid}.${c}.Build.0 = ${c}` + eol);
				
			}
		}
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

async function IfFileStartsWith(filePath, searchString) { 
	const fileContent = await fs.readFile(filePath, 'utf-8');
	return fileContent.startsWith(searchString);
} 

run();