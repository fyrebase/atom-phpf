'use babel';

/*jshint esversion: 6 */

/**
 * PhpF
 *
 * @author Kirk Bentley <kirk@fyrebase.com>
 * @license MIT
 */

import {BufferedProcess} from 'atom';
import minimatch from 'minimatch';
import CSON from 'season';
import path from 'path';
import fs from 'fs-extra';

const projectRoot = atom.project.getPaths()[0]
const hasProjectRoot = !!projectRoot
let projectConfigPath = null

if (hasProjectRoot) {
	projectConfigPath = path.join(projectRoot, 'phpf.cson')
}

class phpf {
	constructor() {
		this.options = {
			phpfmt: {},
			general: {},
			setup: {},
		}

		this.setup = [
			'fmtPath',
			'phpPath',
		]

		this.general = [
			'exclude',
		]

		this.phpfmt = [
			'autoAlign',
			'cakePhp',
			'constructorType',
			'excludePasses',
			'indentWithSpaceSize',
			'passes',
			'psr1',
			'psr1Naming',
			'psr2',
			'settersAndGettersType',
			'visibilityOrder',
			'yodaStyle',
		]
	}

	/**
	 * Retrieve current options from atom config and project configuration file
	 * @return {object}
	 */
	getOptions(po = this.getProjectConfig()) {
		let groups = [
			'phpfmt',
			'general',
			'setup',
		]

		let toArrays = {
			'general': [
				'exclude',
			],
			'phpfmt': [
				'excludePasses',
				'passes',
			],
		}

		// Create Atom config observers

		groups.forEach((group) => {
			this[group].forEach((k) => {
				atom.config.observe(`phpf.${group}.${k}`, () => {
					this.options[group][k] = atom.config.get(`phpf.${group}.${k}`)

					return this.options[group][k]
				})
			})
		})

		Object.keys(toArrays).forEach((group) => {
			toArrays[group].forEach((k) => {
				if (!Array.isArray(this.options[group][k])) {
					let ar = this.options[group][k].split(',')
					this.options[group][k] = ar.filter(entry => entry.trim() !== '')
				}
			})
		})

		// Override Atom settings with project phpf.cson

		if (po !== false) {
			Object.assign(this.options.phpfmt, po.phpfmt)
			Object.assign(this.options.general, po.general)
		}

		return this.options
	}

	/**
	 * Load project configuration file
	 * @return {object}
	 */
	getProjectConfig() {

		if (!hasProjectRoot) {
			return false
		}

		let config

		try {
			config = CSON.readFileSync(projectConfigPath)
		} catch(err) {
			return false
		}

		return config
	}

	/**
	 * Create project configuration file
	 * @return {mixed}
	 */
	createProjectConfig() {
		console.group('phpF - createProjectConfig')

		if (!hasProjectRoot) {
			msg = 'No project root available'
			console.log(msg)
			console.groupEnd()

			return atom.notifications.addError('phpF', { detail: msg })
		}

		let msg

		fs.pathExists(projectConfigPath)
			.then((exists) => {
				if (exists) {
					msg = 'Project configuration already exists'
					console.log(msg)
					console.groupEnd()

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

			console.groupEnd()
	}

	/**
	 * Create phpfmt cli arguments
	 * @param  {string} filePath Path to target file
	 * @return {object}
	 */
	createArgs(filePath, o = this.getOptions()) {
		let args = []

		args.push(o.setup.fmtPath)

		args.push(`-o=${filePath}`)

		if (o.phpfmt.cakePhp) {
			args.push('--cakephp')
		}

		if (o.phpfmt.autoAlign) {
			args.push('--enable_auto_align')
		}

		if (o.phpfmt.psr1) {
			args.push('--psr1')
		}

		if (o.phpfmt.psr1Naming) {
			args.push('--psr1-naming')
		}

		if (o.phpfmt.psr2) {
			args.push('--psr2')
		}

		if (o.phpfmt.visibilityOrder) {
			args.push('--visibility_order')
		}

		if (o.phpfmt.yoda) {
			args.push('--yoda')
		}

		if (o.phpfmt.constructorType !== 'disabled') {
			args.push(`--constructor=${o.phpfmt.constructorType}`)
		}

		if (o.phpfmt.excludePasses.length !== 0) {
			args.push(`--exclude=${o.phpfmt.excludePasses}`)
		}

		if (o.phpfmt.indentWithSpaceSize > 0) {
			args.push(`--indent_with_space=${o.phpfmt.indentWithSpaceSize}`)
		}

		if (o.phpfmt.passes.length !== 0) {
			args.push(`--passes=${o.phpfmt.passes}`)
		}

		if (o.phpfmt.settersAndGettersType !== 'disabled') {
			args.push(`--setters_and_getters=${o.phpfmt.settersAndGettersType}`)
		}

		args.push(filePath)

		let command = o.setup.phpPath

		return { args, command }
	}

	/**
	 * Return config to be displayed in atom package settings
	 * @return {mixed}
	 */
	getConfig() {
		let config

		try {
			config = CSON.readFileSync(path.join(__dirname, './phpf-config.cson'))
		} catch(err) {
			return {}
		}

		return config
	}

	/**
	 * Format buffer
	 * @return {[type]} [description]
	 */
	format() {

		let filePath

		let editor = atom.workspace.getActivePaneItem()

		if (editor && editor.getPath) {
			filePath = editor.getPath()
		}

		Promise.resolve().then(() => {
			return editor.save()
		}).then(() => {

			if (!this.validateProjectConfig()) {
				return
			}

			if (filePath) {
				console.group('phpF')

				let o = this.getOptions()

				let matches = o.general.exclude.some(function(pattern) {
					return minimatch(filePath.replace(projectRoot, ''), pattern)
				})

				if (matches) {
					console.log(`${filePath.replace(projectRoot, '')} is currently excluded from formatting`)
					console.groupEnd()

					return false
				}

				let { args, command } = this.createArgs(filePath, o)

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

	/**
	 * Validate project configuration
	 * @param  {object}
	 * @return {bool}
	 */
	validateProjectConfig(po = this.getProjectConfig()) {
		if (!hasProjectRoot || po === false) {
			return true
		}

		const required = [
			'phpfmt',
		]

		const allowedPrimary = [
			'general',
			'phpfmt',
		]

		const allowedKeys = [...allowedPrimary, ...this.phpfmt, ...this.general]

		let requiredKeyErrors = []
		let invalidKeyErrors = []

		// Check for required primary keys

		required.forEach((k) => {
			if(!po[k]) {
				requiredKeyErrors.push(k)
			}
		})

		// Check for invalid keys

		function validateKeys(obj) {
			for (var k in obj) {
				if (obj.hasOwnProperty(k)) {
					if (!allowedKeys.includes(k)) {
						invalidKeyErrors.push(k)
					}

					if (typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
						validateKeys(obj[k])
					}
				}
			}
		}

		validateKeys(po, '')

		if (requiredKeyErrors.length) {
			atom.notifications.addError('phpF', { detail: `Your project configuration file is missing the following required keys: ${requiredKeyErrors.join(', ')}` })

			return false
		}

		if (invalidKeyErrors.length) {
			atom.notifications.addWarning('phpF', { detail: `Your project configuration contains the following invalid keys: ${invalidKeyErrors.join(', ')}` })

			return false
		}

		return true
	}
}

module.exports = new phpf()
