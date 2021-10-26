# create-solution

This is a Github action for create a Visual Studio solution file and add existing projects.

Example:


    name: "Test"

    on: [push, pull_request]

    jobs:
      build:
        runs-on: windows-2022
    
        steps:
        - name: Install checkout
          uses: actions/checkout@v2
      
        - name: Add msbuild to PATH
          uses: microsoft/setup-msbuild@v1
      
        - name: Create solution
          uses: Bassman2/create-solution@v1
          with:
		    name: TestSolution
            version: 2022
			projects: 
			[  
			- type: CSCore
			  name: test1
			  path: test1.csproj
			- type: CSFramework
			  name: test2.csproj
			  path: test2.csproj
			- type CSShare
			  name: test3
			  path: test3.shproj
  		    - type SHFB
			  name: doc
			  path: doc.shfbproj			
			]
        
        - name: Create Test Documentation
          run: msbuild TestSolution.sln /p:configuration="Release" /m /verbosity:minimal

A test repository is available at https://github.com/Bassman2/create-solution-Test.
