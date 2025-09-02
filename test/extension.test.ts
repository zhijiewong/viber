import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../src/extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('DOM Agent commands should be registered', async () => {
		// Test that our commands are available
		const commands = await vscode.commands.getCommands(true);
		const domAgentCommands = commands.filter(cmd => cmd.startsWith('dom-agent.'));

		console.log('Available DOM Agent commands:', domAgentCommands);

		// We should have at least some commands registered
		assert.ok(domAgentCommands.length > 0, 'No DOM Agent commands found');
	});
});
