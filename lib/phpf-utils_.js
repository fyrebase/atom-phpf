'use babel';

/*jshint esversion: 6 */

import CSON from 'season';
import path from 'path';
import fs from 'fs-extra';

const projectConfigPath = path.join(atom.project.getPaths()[0], 'phpf.cson')

let phpfUtils

module.exports = phpfUtils = {
	options: {
		setup: {},
		general: {}
	},

	setup: [
		'debug',
		'fmtPath',
		'phpPath',
	],

	general: [
		'autoAlign',
		'cache',
		'cacheFilename',
		'cakePhp',
		'constructorType',
		'excludePasses',
		'indentWithSpaceSize',
		'noBackup',
		'passes',
		'psr1',
		'psr1Naming',
		'psr2',
		'settersAndGettersType',
		'visibilityOrder',
		'yodaStyle'
	],

	/**
	 * Retrieve current options from atom config and project configuration file
	 * @return {object}
	 */
	getOptions: function() {
		let po = this.getProjectConfig()
		let groups = ['setup', 'general']

		// Create Atom config observers

		groups.forEach((group) => {
			this[group].forEach((k) => {
				atom.config.observe(`phpf.${group}.${k}`, () => {
					this.options[group][k] = atom.config.get(`phpf.${group}.${k}`)

					return this.options[group][k]
				})
			})
		})

		// Override Atom settings with project phpf.cson

		Object.assign(this.options.general, po)

		return this.options
	},

	/**
	 * Load project configuration file
	 * @return {object}
	 */
	getProjectConfig() {
		let config

		try {
			config = CSON.readFileSync(projectConfigPath)
		} catch(err) {
			console.warn('phpF - No project configuration file found')

			return {}
		}

		console.info('phpF - found project configuration file')

		return config
	},

	/**
	 * Create project configuration file
	 * @return {mixed}
	 */
	createProjectConfig() {
		let msg

		fs.pathExists(projectConfigPath)
			.then((exists) => {
				if (exists) {
					msg = 'Project configuration already exists'
					console.log(msg)

					return atom.notifications.addWarning('phpF', { detail: msg })
				}

				fs.copy(path.join(__dirname, '..', 'dist.phpf'), projectConfigPath)
				.then(() => {
					msg = 'Project configuration file created'
					console.log(msg)
					atom.notifications.addSuccess('phpF', { detail: msg })

					atom.workspace.open(projectConfigPath)
				})
				.catch((err) => {
					console.error(err)
					atom.notifications.addError('phpF', { detail: err.message })
				})
			})
	},

	/**
	 * Create cli arguments
	 * @param  {string} filePath Path to target file
	 * @return {object}
	 */
	createArgs(filePath) {
		let o = this.getOptions()
		let args = []

		args.push(o.setup.fmtPath)

		if (o.setup.debug) { args.push('-v') }

		args.push(`-o=${filePath}`)

		if (o.general.cache) {
			args.push('--cache')
		}

		if (o.general.cakePhp) {
			args.push('--cakephp')
		}

		if (o.general.autoAlign) {
			args.push('--enable_auto_align')
		}

		if (o.general.noBackup) {
			args.push('--no-backup')
		}

		if (o.general.psr1) {
			args.push('--psr1')
		}

		if (o.general.psr1Naming) {
			args.push('--psr1-naming')
		}

		if (o.general.psr2) {
			args.push('--psr2')
		}

		if (o.general.visibilityOrder) {
			args.push('--visibility_order')
		}

		if (o.general.yoda) {
			args.push('--yoda')
		}

		if (o.general.cache && o.general.cacheFilename.length !== 0) {
			args.push(`--cache=${o.general.cacheFilename}`)
		}

		if (o.general.constructorType !== 'disabled') {
			args.push(`--constructor=${o.general.constructorType}`)
		}

		if (o.general.excludePasses.length !== 0) {
			args.push(`--exclude=${o.general.excludePasses}`)
		}

		if (o.general.indentWithSpaceSize > 0) {
			args.push(`--indent_with_space=${o.general.indentWithSpaceSize}`)
		}

		if (o.general.passes.length !== 0) {
			args.push(`--passes=${o.general.passes}`)
		}

		if (o.general.settersAndGettersType !== 'disabled') {
			args.push(`--setters_and_getters=${o.general.settersAndGettersType}`)
		}

		args.push(filePath)

		let command = o.setup.phpPath

		return { args, command }
	},

	/**
	 * Return config to be displayed in atom package settings
	 * @return {object}
	 */
	getConfig() {
		let config

		try {
			config = CSON.readFileSync(path.join(__dirname, './phpf-config.cson'))
		} catch(err) {
			return {}
		}

		console.log(config);

		return config
	}
}