#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const aiDocsDir = path.join(cwd, 'ai-docs');
const codeRudderDir = path.join(cwd, '.code-rudder');
const stateFile = path.join(codeRudderDir, 'state.json');
const templatesDir = path.join(__dirname, '../templates');

// Create ai-docs directory if it doesn't exist
if (!fs.existsSync(aiDocsDir)) {
	fs.mkdirSync(aiDocsDir, { recursive: true });
	console.log('Created ai-docs directory');
}

// Copy template files to ai-docs
if (fs.existsSync(templatesDir)) {
	const templateFiles = fs.readdirSync(templatesDir);
	templateFiles.forEach(file => {
		const srcPath = path.join(templatesDir, file);
		const destPath = path.join(aiDocsDir, file);

		// Only copy if destination doesn't exist
		if (!fs.existsSync(destPath)) {
			fs.copyFileSync(srcPath, destPath);
			console.log(`Copied ${file} to ai-docs/`);
		}
	});
} else {
	console.error('Templates directory not found');
	process.exit(1);
}

// Create .code-rudder directory and state.json if they don't exist
if (!fs.existsSync(codeRudderDir)) {
	fs.mkdirSync(codeRudderDir, { recursive: true });
	console.log('Created .code-rudder directory');
}

if (!fs.existsSync(stateFile)) {
	const defaultState = {
		enabled: true,
		attempts: []
	};
	fs.writeFileSync(stateFile, JSON.stringify(defaultState, null, 2));
	console.log('Created state.json with default values');
} else {
	// Update existing state.json to set enabled to true
	const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
	state.enabled = true;
	fs.writeFileSync(stateFile, JSON.stringify(state, null, 2));
	console.log('Updated enabled field to true in state.json');
}

console.log('\nRudder started successfully!');
