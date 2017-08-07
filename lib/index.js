'use babel';

/*jshint esversion: 6 */

/**
 * PhpF
 *
 * @author Kirk Bentley <kirk@fyrebase.com>
 * @license MIT
 */

import {CompositeDisposable} from 'atom';
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
		phpf.createProjectConfig()
	},

	format() {
		phpf.format()
	}
}
