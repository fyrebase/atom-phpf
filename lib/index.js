'use babel';

/*jshint esversion: 6 */

import {CompositeDisposable} from 'atom';
import {BufferedProcess} from 'atom';
import phpf from './phpf';

module.exports = {
	subscriptions: null,
	config: phpf.getConfig(),

	activate() {
		this.subscriptions = new CompositeDisposable()

		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'phpf:create': () => this.createProjectConfig()
		}))

		this.subscriptions.add(atom.commands.add('atom-workspace', {
			'phpf:format': () => this.format()
		}))
	},

	deactivate() {
		this.subscriptions.dispose()
	},

	createProjectConfig() {
		console.group('phpF - createProjectConfig')

		phpf.createProjectConfig()

		console.groupEnd()
	},

	format() {
		let filePath

		let editor = atom.workspace.getActivePaneItem()

		if (editor && editor.getPath) {
			filePath = editor.getPath()
		}

		Promise.resolve().then(() => {
			return editor.save()
		}).then(() => {
			if (filePath) {
				console.group('phpF')

				let { args, command } = phpf.createArgs(filePath)

				console.log('Command:', command)
				console.log('Args:', args)
				console.log('Filepath:', filePath)

				let exit = code => console.log(`${command} exited with code: ${code}`)
				let stderr = output => console.error(output)
				let stdout = output => console.log(output)

				let process = new BufferedProcess({
					args,
					command,
					exit,
					stderr,
					stdout
				})

				console.groupEnd()

				return process
			}
		}).catch(err => {
			console.error(err)

			if (err.message === 'Can\'t save buffer with no file path') {
				err.message = 'Please save your file before formatting.'
			}

			atom.notifications.addError('phpF', {
				detail: err.message
			})
		})
	}
}
