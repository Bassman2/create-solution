const core = require('@actions/core'),
	  uuid = require('uuid'),
      path = require('path'),
	  fs = require('fs');

const eol = "\r\n";	
		
const PrjType = {
	Folder: 1,
	CSFramework: 2,
	CSCore: 3,
	VBFramework: 4,
	VBCore: 5,
	Share: 6,
	VisualC: 7,
	SandcastleHelpFileBuilder: 8,
	Setup: 9,
	FS: 10
};

// https://newbedev.com/visual-studio-project-type-guids

const projectGuidFolder = '{2150E333-8FDC-42A3-9474-1A3956D46DE8}';
const projectGuidVC = '{8BC9CEB8-8B4A-11D0-8D11-00A0C91BC942}';
const projectGuidVBFramework = '{F184B08F-C81C-45F6-A57F-5ABD9991F28F}';
const projectGuidVBCore = '{778DAE3C-4631-46EA-AA77-85C1314464D9}';
const projectGuidCSFramework = '{FAE04EC0-301F-11D3-BF4B-00C04F79EFBC}';
const projectGuidCSCore = '{9A19103F-16F7-4668-BE54-9A1E7A4F7556}';
const projectGuidShare = '{D954291E-2A0B-460D-934E-DC6B0785DB48}';
const projectGuidSandcastle = '{7CF6DF6D-3B04-46F8-A40B-537D21BCA0B4}';
const projectGuidFS = '{6EC3EE1D-3C4E-46DD-8F32-0CC8E7565705}';
const projectGuidSetup = '{54435603-DBB4-11D2-8724-00A0C9A8B90C}';
		
async function run() {
    try {
		const solutionGuid = `{${uuid.v4()}}`;
		
		const solutionName = core.getInput('name');
        const solutionProjects = core.getInput('projects').split(',').map(p => p.trim());
        const solutionConfigs = (core.getInput('configurations') || 'Debug|Any CPU,Release|Any CPU').split(',').map(p => p.trim());
		
        // output infos
        console.log('name: ', solutionName);
        console.log('projects: ', solutionProjects);
        console.log('configurations: ', solutionConfigs);

        var projects = [];
		for (const solutionProject of solutionProjects) { 
			var ext = path.extname(solutionProject);
			var prjType = PrjType.Folder
			var prjUuid = '';
			var prjConf = false;
			var prjShare = false;
			switch (ext) {
				// C# project
				case '.csproj':
					prjConf = true;
					if (IfFileStartsWith(solutionProject, '<Project')) {
						prjType = PrjType.CSCore;
						prjUuid = projectGuidCSCore;
					} else {
						prjType = PrjType.CSFramework;
						prjUuid = projectGuidCSFramework;						
					}
					break;

				// F# project
				case 'fsproj':
					prjConf = true;
					prjType = PrjType.FS;
					prjUuid = projectGuidFS;
					break;

				// shared project
				case '.shproj':
					prjConf = false;
					prjShare = true;
					prjType = PrjType.Share;
					prjUuid = projectGuidShare;
					break;

				// Visual Basic project
				case '.vbproj':
					prjConf = true;
					if (IfFileStartsWith(solutionProject, '<Project')) {
						prjType = PrjType.VBCore;
						prjUuid = projectGuidVBCore
					} else {
						prjType = PrjType.VBFramework;
						prjUuid = projectGuidVBFramework;
					}
					break;
					
				// C++ project
				case '.vcxproj':
					prjConf = true;
					prjType = PrjType.VisualC;
					prjUuid = projectGuidVC;
					break;
					
				// Setup project
				case '.vdproj':
					prjConf = true;
					prjType = PrjType.Setup;
					prjUuid = projectGuidSetup;
					break;
					
				// Sandcastle Help File Builder project
				case '.shfbproj':
					prjConf = true;
					prjType = PrjType.SandcastleHelpFileBuilder;
					prjUuid = projectGuidSandcastle
					break;
					
				// Solution Folder	
				case '':
					prjConf = false;
					prjType = PrjType.Folder;
					prjUuid = projectGuidFolder;
					break;
					
				// unknown
				default:
					core.setFailed(`${ext} not defined`);
					break;
			}					
		
			let p = {
				"type": prjType,
				"conf": prjConf,
				"share": prjShare,
				"typeid" : prjUuid,
				"name" : path.basename(solutionProject).split('.').slice(0, -1).join('.'),
				"path" : solutionProject,
				"prjid": `{${uuid.v4()}}`,
				"items": solutionProject.substr(0, solutionProject.lastIndexOf(".")) + '".projitems'
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

		if (projects.some(p => p.share)) {
			writer.write('    GlobalSection(SharedMSBuildProjectFiles) = preSolution' + eol);
			for (const p of projects.filter(p => p.share)) {
				writer.write(`    ${items}*${prjid}*SharedItemsImports = 13` + eol);
			}
			writer.write('    EndGlobalSection' + eol);
		}

		writer.write('    GlobalSection(SolutionConfigurationPlatforms) = preSolution' + eol);
		for (const c of solutionConfigs) {
			writer.write(`        ${c} = ${c}` + eol);
		}
		writer.write('    EndGlobalSection' + eol);

		writer.write('    GlobalSection(ProjectConfigurationPlatforms) = postSolution' + eol);
		for (const p of projects.filter(p => p.conf)) {
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
		writer.write(`        SolutionGuid = ${solutionGuid}` + eol);
		writer.write('    EndGlobalSection' + eol);
		writer.write('EndGlobal' + eol);

		writer.end();

    }
    catch (error) {
        core.setFailed(error.message);
    }
}

function IfFileStartsWith(filePath, searchString) { 
	const fileContent = fs.readFileSync(filePath, 'utf-8');
	return fileContent.startsWith(searchString);
} 

run();