# PhpF:sparkles:

**PhpF** is a package for Atom which will have your code looking polished in no time.

Simply configure it to your desired standards and your bad code formatting anxiety will fade away*..

### Project Overrides

Create custom formatting standards per project. Run the **PhpF Create Project Config** command from the menu or command palette to quickly generate a `phpf.cson` project configuration file in your project root. Customise your project settings and commit them to your repo to share amongst your team!

**Note:** All options in the package settings screen will be overridden by those specified in the `phpf.cson` project configuration file

### Exclude Files / Directories

PhpF allows you to exclude files and directories from being formatted. Just throw them in the project config or the settings screen!

## Requirements

#### php

php 5.6 or newer

#### phpfmt

**phpfmt** is a php archive which beautifies your PHP code, following configurable coding guidelines.

You will need to download a copy of **phpfmt**. There are several versions of it floating around the internet

Try starting with these...

- https://github.com/nanch/phpfmt_stable
- https://github.com/subins2000/phpF

Drop it somewhere like `/usr/local/bin` and add the path to the **PhpF** package settings screen within **atom**.

---
<small><small>*Hopefully, fingers crossed, no guarantees</small></small>


## Changelog


### 1.0.2 -- 08/08/2017

* **[Fixed]** Fixed `README.md` and package version

### 1.0.1 -- 08/08/2017

* **[Fixed]** Fixed issue when installing package or creating a project configuration file and no project root existed

### 1.0.0 -- 08/08/2017

* **[Added]** `phpf.cson` project configuration file validation
* **[Added]** Ability to exclude files / folders via globbing within settings panel and `phpf.cson` project configuration file
* **[Improved]** Cleaned up `README.md`

### 0.1.2 -- 04/08/2017

* **[Improved]** Cleaned up project configuration template

### 0.1.1 -- 04/08/2017

* **[Improved]** Updated project description