All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.


## [0.7.6](https://github.com/ottomatica/opunit/compare/v0.7.5...v0.7.6) (2020-06-06)


### Bug Fixes

* fixing ssh reachable check (~) ([b3e65c5](https://github.com/ottomatica/opunit/commit/b3e65c5a4530f4278e7187433770a5a4fba7bbd5))



## [0.7.5](https://github.com/ottomatica/opunit/compare/v0.7.4...v0.7.5) (2020-06-05)


### Bug Fixes

* fixing ssh contains check (~) ([c1ebf14](https://github.com/ottomatica/opunit/commit/c1ebf14584fabdd892ba7e73e93f88fd51a81f44))



## [0.7.4](https://github.com/ottomatica/opunit/compare/v0.7.3...v0.7.4) (2020-06-03)


### Features

* setting timeout in availability check args + ([781e7f1](https://github.com/ottomatica/opunit/commit/781e7f1b30bbb20086e15ec0edea1dd50086d900))



## [0.7.3](https://github.com/ottomatica/opunit/compare/v0.7.2...v0.7.3) (2020-06-03)


### Features

* supporting local connector in inventory ([625e16f](https://github.com/ottomatica/opunit/commit/625e16ff96f6d1ed33fa6a4926142e2542f97005))



## [0.7.2](https://github.com/ottomatica/opunit/compare/v0.7.1...v0.7.2) (2020-06-02)


### Features

* add query to report in json contains check ([da1f383](https://github.com/ottomatica/opunit/commit/da1f383372f2e080d368c4351c0f851800e6a658))



## [0.7.1](https://github.com/ottomatica/opunit/compare/v0.7.0...v0.7.1) (2020-06-02)


### Features

* and/or support in availability port ([c8730ff](https://github.com/ottomatica/opunit/commit/c8730ff0352d993817ffe1c6fd1e5766daf072c8))



# [0.7.0](https://github.com/ottomatica/opunit/compare/v0.6.3...v0.7.0) (2020-05-16)


### Features

* adding 'query' in contains, an alt for jq ([14ae635](https://github.com/ottomatica/opunit/commit/14ae63524a65cdbd3565bc655144cbf0410d0ef6))
* adding env check for environment variables ([59c9328](https://github.com/ottomatica/opunit/commit/59c93283a524e18cb12da4a8601cca3959c45b77))
* check HyperV on win32 + msg in virt check ([d980ed2](https://github.com/ottomatica/opunit/commit/d980ed28f34d9ea2482fe42dfc21b7be93f2a447))



## [0.6.3](https://github.com/ottomatica/opunit/compare/v0.6.2...v0.6.3) (2020-02-14)


### Bug Fixes

* update infra.connectors for exec bug fix ([ce17c3d](https://github.com/ottomatica/opunit/commit/ce17c3d68ce521220711c8ff32765fa61d5d3789))



## [0.6.2](https://github.com/ottomatica/opunit/compare/v0.6.1...v0.6.2) (2020-02-14)


### Bug Fixes

* updating infra.connectors for exec fix ([0090ab1](https://github.com/ottomatica/opunit/commit/0090ab19e735498b7ac201f3d9f05ffdb1dac071))



## [0.6.1](https://github.com/ottomatica/opunit/compare/v0.6.0...v0.6.1) (2020-02-13)

### Build System

* **deps:** [feature] updating infra.connectors ([3647b82](https://github.com/ottomatica/opunit/commit/3647b8212f3a9af49e7c690d7b8ea69091ec9535))


# [0.6.0](https://github.com/ottomatica/opunit/compare/v0.5.1...v0.6.0) (2020-02-13)


### Features

* adding a msg for reachability permissions ([2c90f58](https://github.com/ottomatica/opunit/commit/2c90f588bf4770bc2c451ff31cee7b21d1ebe75b))
* adding jq queries in contains check ([9040c69](https://github.com/ottomatica/opunit/commit/9040c699063e402f393293fc208c3834780a4c09))
* adding valid check (JSON validation) ([649118d](https://github.com/ottomatica/opunit/commit/649118d2dacf9a1f66ade03f05136cfb9e4c9688))
* adding valid check (YAML validation) ([736a27b](https://github.com/ottomatica/opunit/commit/736a27b088284d1a740db4d381314b79b2666241))
* use https in availability check, if port=443 ([ef242e3](https://github.com/ottomatica/opunit/commit/ef242e3dcba00d20ff68b8879612b399a8b670a0))
* remove jq from report if jq is not used ([de75ec5](https://github.com/ottomatica/opunit/commit/de75ec574bd460a25aa460954f20c036f1c4e2a4)), closes [#204](https://github.com/ottomatica/opunit/issues/204)
* usr/grp + part permission in reachable (PoC) ([4bb9fe3](https://github.com/ottomatica/opunit/commit/4bb9fe3057f409e6831970a79fb95ac96a957575))
* usr/grp with octal permission in  reachable ([f15b21d](https://github.com/ottomatica/opunit/commit/f15b21de625cd6c11714f67735a44ce52ca66448))
* valid checks for local connector ([c162191](https://github.com/ottomatica/opunit/commit/c162191a58f9f4a1e3279fc1282c1f5aeb31869e))

### Bugs

* set rejectUnauthorized=false in availability ([f5d53e3](https://github.com/ottomatica/opunit/commit/f5d53e3a639cf66c9e1df6bd83a7e23a2dcbb4a1))


## [0.5.1](https://github.com/ottomatica/opunit/compare/v0.5.0...v0.5.1)

### Bug Fixes

* better msg for file permission ([b77a7e4](https://github.com/ottomatica/opunit/commit/2a14b3793c2131eb5a0ad4da410224f7fc7456ed))


## [0.5.0](https://github.com/ottomatica/opunit/compare/v0.4.6...v0.5.0)

### Bug Fixes

* fixing missing function in contains ([b77a7e4](https://github.com/ottomatica/opunit/commit/b77a7e473a150405cd0d7eb1763eaf45cf6235db))
* fixing missing function in contains ([9c901b5](https://github.com/ottomatica/opunit/commit/9c901b5d6e994499f4cd9662f17a8809be1d626f))
* fixing missing function in contains ([b259afa](https://github.com/ottomatica/opunit/commit/b259afa0b14baa2d5ea1f396d68eaf4179ff88ff))

## [0.4.6](https://github.com/ottomatica/opunit/compare/v0.4.5...v0.4.6)

### Bug Fixes

* Improve printing of carriage returns/newlines. ([66e87cf](https://github.com/ottomatica/opunit/commit/66e87cf2ea32e04f2af340b80fff9f5a38c42c6c))


## [0.4.5](https://github.com/ottomatica/opunit/compare/v0.4.4...v0.4.5)

### Bug Fixes

* allow contains check to receive expect:false ([beeca44](https://github.com/ottomatica/opunit/commit/beeca4493b7fa6ba34c237c0b768d7b17b39cd5a))


### Features

* updating reachable to check permission ([dc1cee0](https://github.com/ottomatica/opunit/commit/dc1cee03854ff3b78ddc2db1b651be46c891c84c))
* using octal permission in reachable check ([4788790](https://github.com/ottomatica/opunit/commit/47887903fad11cddaa30d4a851d73ef831bf75d7))


## [0.4.4](https://github.com/ottomatica/opunit/compare/v0.4.3...v0.4.4) (2020-01-29)


### Bug Fixes

* using resolvePath for ssh key path ([9d45e18](https://github.com/ottomatica/opunit/commit/9d45e18b4a3b934296c8bc22c4cebbab99acb3f1))

### Features

* VT check for ssh environments ([#155](https://github.com/ottomatica/opunit/issues/155)) ([e256732](https://github.com/ottomatica/opunit/commit/e256732e057ef46b87a844ffb8cc719bcebb1402))


### [0.4.3](https://github.com/ottomatica/opunit/compare/v0.4.2...v0.4.3) (2019-08-18)


### Build System

* **deps:** [security] bump lodash from 4.17.11 to 4.17.14 ([#138](https://github.com/ottomatica/opunit/issues/138)) ([db2f982](https://github.com/ottomatica/opunit/commit/db2f982))
* **deps:** [security] bump lodash.template from 4.4.0 to 4.5.0 ([#132](https://github.com/ottomatica/opunit/issues/132)) ([25491c3](https://github.com/ottomatica/opunit/commit/25491c3))
* **deps:** bump semver from 6.2.0 to 6.3.0 ([#143](https://github.com/ottomatica/opunit/issues/143)) ([b037763](https://github.com/ottomatica/opunit/commit/b037763))
* **deps:** bump ssh2 from 0.8.4 to 0.8.5 ([#133](https://github.com/ottomatica/opunit/issues/133)) ([c0e694d](https://github.com/ottomatica/opunit/commit/c0e694d))
* **deps:** bump systeminformation to 4.14.4 ([#140](https://github.com/ottomatica/opunit/issues/140)) ([8b83bfb](https://github.com/ottomatica/opunit/commit/8b83bfb))
* **deps:** bump yargs from 13.2.4 to 13.3.0 ([#134](https://github.com/ottomatica/opunit/issues/134)) ([dc09095](https://github.com/ottomatica/opunit/commit/dc09095))
* **deps-dev:** bump commitizen to 4.0.3 ([#139](https://github.com/ottomatica/opunit/issues/139)) ([ac4c8da](https://github.com/ottomatica/opunit/commit/ac4c8da))
* **deps-dev:** bump cz-conventional-changelog from 2.1.0 to 3.… ([#141](https://github.com/ottomatica/opunit/issues/141)) ([a2560b4](https://github.com/ottomatica/opunit/commit/a2560b4))
* **deps-dev:** bump eslint from 5.16.0 to 6.1.0 ([#146](https://github.com/ottomatica/opunit/issues/146)) ([2a90654](https://github.com/ottomatica/opunit/commit/2a90654))
* **deps-dev:** bump eslint-config-airbnb-base from 13.2.0 to 1… ([#145](https://github.com/ottomatica/opunit/issues/145)) ([3ab111b](https://github.com/ottomatica/opunit/commit/3ab111b))
* **deps-dev:** bump eslint-plugin-import to 2.18.2 ([#142](https://github.com/ottomatica/opunit/issues/142)) ([f36ff34](https://github.com/ottomatica/opunit/commit/f36ff34))
* **deps-dev:** bump standard-version from 6.0.1 to 7.0.0 ([#144](https://github.com/ottomatica/opunit/issues/144)) ([f607152](https://github.com/ottomatica/opunit/commit/f607152))



### [0.4.2](https://github.com/ottomatica/opunit/compare/v0.4.1...v0.4.2) (2019-07-05)


### Bug Fixes

* "./Baker.yml" -> "./baker.yml" ([cb955e9](https://github.com/ottomatica/opunit/commit/cb955e9))
* fixes bakerConn when env_address is provided ([f8159ac](https://github.com/ottomatica/opunit/commit/f8159ac)), closes [#129](https://github.com/ottomatica/opunit/issues/129)


### Build System

* **deps:** bump check-disk-space from 2.0.0 to 2.1.0 ([#119](https://github.com/ottomatica/opunit/issues/119)) ([495f7f9](https://github.com/ottomatica/opunit/commit/495f7f9))
* **deps:** bump fs-extra from 8.0.1 to 8.1.0 ([#120](https://github.com/ottomatica/opunit/issues/120)) ([c02820c](https://github.com/ottomatica/opunit/commit/c02820c))
* **deps:** bump semver to 6.2.0 ([#125](https://github.com/ottomatica/opunit/issues/125)) ([7b5a7a2](https://github.com/ottomatica/opunit/commit/7b5a7a2))
* **deps:** bump systeminformation to 4.10.0 ([#112](https://github.com/ottomatica/opunit/issues/112)) ([6c71e79](https://github.com/ottomatica/opunit/commit/6c71e79))
* **deps-dev:** bump eslint-config-airbnb-base from 13.1.0 to 1… ([#124](https://github.com/ottomatica/opunit/issues/124)) ([42ae4c5](https://github.com/ottomatica/opunit/commit/42ae4c5))
* **deps-dev:** bump eslint-plugin-import from 2.17.3 to 2.18.0 ([#118](https://github.com/ottomatica/opunit/issues/118)) ([e310fbf](https://github.com/ottomatica/opunit/commit/e310fbf))



### [0.4.1](https://github.com/ottomatica/opunit/compare/v0.4.0...v0.4.1) (2019-06-13)


### Build System

* **deps:** bump check-disk-space from 1.5.0 to 2.0.0 ([#108](https://github.com/ottomatica/opunit/issues/108)) ([a263d0f](https://github.com/ottomatica/opunit/commit/a263d0f))
* **deps:** bump fs-extra to 8.0.1 ([#100](https://github.com/ottomatica/opunit/issues/100)) ([cbe729e](https://github.com/ottomatica/opunit/commit/cbe729e))
* **deps:** bump semver to 6.1.1 ([#105](https://github.com/ottomatica/opunit/issues/105)) ([39431a1](https://github.com/ottomatica/opunit/commit/39431a1))
* **deps:** bump systeminformation to 4.9.2 ([#111](https://github.com/ottomatica/opunit/issues/111)) ([825976c](https://github.com/ottomatica/opunit/commit/825976c))
* **deps:** bump yargs from 13.2.2 to 13.2.4 ([#99](https://github.com/ottomatica/opunit/issues/99)) ([43ca02c](https://github.com/ottomatica/opunit/commit/43ca02c))
* **deps-dev:** bump eslint-plugin-import from 2.17.2 to 2.17.3 ([#103](https://github.com/ottomatica/opunit/issues/103)) ([d6d5730](https://github.com/ottomatica/opunit/commit/d6d5730))



# [0.4.0](https://github.com/ottomatica/opunit/compare/v0.3.2...v0.4.0) (2019-05-06)


### Bug Fixes

* Fix reachable check for directories ([8f3e812](https://github.com/ottomatica/opunit/commit/8f3e812))
* **checks:** Fixes conditional statement in reachable check ([2aaf6c7](https://github.com/ottomatica/opunit/commit/2aaf6c7))
* **checks:** reachable check should use status of last redirect ([5b83f98](https://github.com/ottomatica/opunit/commit/5b83f98))
* **reachable:** parses redirected headers and searches for 200 ok ([#80](https://github.com/ottomatica/opunit/issues/80)) ([35e986d](https://github.com/ottomatica/opunit/commit/35e986d))


### Features

* Exit code = 1 when any checks fail ([50fb273](https://github.com/ottomatica/opunit/commit/50fb273))



<a name="0.3.2"></a>
## [0.3.2](https://github.com/ottomatica/opunit/compare/v0.3.1...v0.3.2) (2019-02-07)



<a name="0.3.1"></a>
## [0.3.1](https://github.com/ottomatica/opunit/compare/v0.3.0...v0.3.1) (2019-01-30)


### Bug Fixes

* **checks:**  Fix reachable check for Baker and ssh connector ([7d05ecc](https://github.com/ottomatica/opunit/commit/7d05ecc))
* correct output when no match found. ([984329b](https://github.com/ottomatica/opunit/commit/984329b))
* improve version matching [#43](https://github.com/ottomatica/opunit/issues/43) ([10e9a8f](https://github.com/ottomatica/opunit/commit/10e9a8f))



<a name="0.3.0"></a>
# 0.3.0 (2019-01-03)


### Bug Fixes

* checkFile ([fa2874f](https://github.com/ottomatica/opunit/commit/fa2874f))
* checkFile should use pathExists in connector ([18ce757](https://github.com/ottomatica/opunit/commit/18ce757))
* Fix isReachable() for ssh connectors ([04dd5b9](https://github.com/ottomatica/opunit/commit/04dd5b9))
* Fix resolvePath helper function ([e8f7cc7](https://github.com/ottomatica/opunit/commit/e8f7cc7))
* Fix resolving path in `contains` check ([094d5b4](https://github.com/ottomatica/opunit/commit/094d5b4))
* remove stray console.log ([2b243ee](https://github.com/ottomatica/opunit/commit/2b243ee))
* **checks:** Add `tearDown()` for ssh (and Vagrant) connector ([66c9e22](https://github.com/ottomatica/opunit/commit/66c9e22)), closes [#39](https://github.com/ottomatica/opunit/issues/39)
* **checks:** Fix capability check for local connector ([effd57a](https://github.com/ottomatica/opunit/commit/effd57a))
* **connectors:** Connectors now check if environment is ready ([a27dbe8](https://github.com/ottomatica/opunit/commit/a27dbe8)), closes [#7](https://github.com/ottomatica/opunit/issues/7)


### Features

* Adjusting bold aesthetic ([19fa60b](https://github.com/ottomatica/opunit/commit/19fa60b))
* Experimental profile feature. ([01419dc](https://github.com/ottomatica/opunit/commit/01419dc))
* print group description ([4e1c845](https://github.com/ottomatica/opunit/commit/4e1c845))
* **checks:** Reachable support for local ([559165a](https://github.com/ottomatica/opunit/commit/559165a))
* support comments for checks. ([9b7d20f](https://github.com/ottomatica/opunit/commit/9b7d20f))
* **checks:** Availability check for ssh connector ([af5e211](https://github.com/ottomatica/opunit/commit/af5e211))
* **checks:** Availability check for Vagrant connector ([c6e137c](https://github.com/ottomatica/opunit/commit/c6e137c)), closes [#32](https://github.com/ottomatica/opunit/issues/32) [#32](https://github.com/ottomatica/opunit/issues/32) [#32](https://github.com/ottomatica/opunit/issues/32)
* **checks:** Capability check for virtualization, local connector POC ([be4cea2](https://github.com/ottomatica/opunit/commit/be4cea2))



<a name="0.2.0"></a>
# 0.2.0 (2018-11-11)


### Bug Fixes

* **connectors:** Show correct error message if couldn't find Vagrant ([f1bb3fb](https://github.com/ottomatica/opunit/commit/f1bb3fb))
* Auto select connector now works for Docker and Vagrant from any dir ([6e4e727](https://github.com/ottomatica/opunit/commit/6e4e727))
* Fix inventory to skip failing environments and continue to next one ([12bc8d0](https://github.com/ottomatica/opunit/commit/12bc8d0))
* **checks:** Fix capability check report message ([0996694](https://github.com/ottomatica/opunit/commit/0996694))
* Fix inventory which was broken after adding connector auto select ([91ba27b](https://github.com/ottomatica/opunit/commit/91ba27b)), closes [#16](https://github.com/ottomatica/opunit/issues/16)
* **checks:** Fix capability check to work, even if not checking disk ([94e173e](https://github.com/ottomatica/opunit/commit/94e173e))
* **checks:** Fix timezone check to get correct val from `date` command ([fcd4930](https://github.com/ottomatica/opunit/commit/fcd4930))
* **checks:** Updating capability check report message ([9630321](https://github.com/ottomatica/opunit/commit/9630321)), closes [#20](https://github.com/ottomatica/opunit/issues/20)
* **connectors:** Fix Vagrant connector to work from any directory ([e8bb89f](https://github.com/ottomatica/opunit/commit/e8bb89f)), closes [#21](https://github.com/ottomatica/opunit/issues/21)
* **connectors:** Show correct error message if cannot connect to Docker ([9d81c01](https://github.com/ottomatica/opunit/commit/9d81c01)), closes [#19](https://github.com/ottomatica/opunit/issues/19)
* **connectors:** Show correct error message if couldn't find any env ([79a66c7](https://github.com/ottomatica/opunit/commit/79a66c7)), closes [#19](https://github.com/ottomatica/opunit/issues/19)
* **connectors:** Use `cwd/test/opunit.yml` if criteria path is not given ([92b9622](https://github.com/ottomatica/opunit/commit/92b9622))
* Connectors check if environment is ready ([a27dbe8](https://github.com/ottomatica/opunit/commit/a27dbe8)), closes [#7](https://github.com/ottomatica/opunit/issues/7)


### Features

* **checks:** Add timezone check ([f92bb5d](https://github.com/ottomatica/opunit/commit/f92bb5d)), closes [#22](https://github.com/ottomatica/opunit/issues/22)
* **checks:** Capability check for free disk space ([3994fd4](https://github.com/ottomatica/opunit/commit/3994fd4))
* **checks:** Capability check for memory and cpu cores ([9291461](https://github.com/ottomatica/opunit/commit/9291461)), closes [#20](https://github.com/ottomatica/opunit/issues/20)
* **connectors:** Add local connector for Linux hosts ([5946d61](https://github.com/ottomatica/opunit/commit/5946d61)), closes [#25](https://github.com/ottomatica/opunit/issues/25)
* **connectors:** Auto select connector type based on content of cwd or parameters  ([5796ddd](https://github.com/ottomatica/opunit/commit/5796ddd)), closes [#19](https://github.com/ottomatica/opunit/issues/19)
* Inventory file to support running checks on multiple instances ([8acca9e](https://github.com/ottomatica/opunit/commit/8acca9e)), closes [#16](https://github.com/ottomatica/opunit/issues/16)
* support negation in contains check. ([bc3c5e9](https://github.com/ottomatica/opunit/commit/bc3c5e9))
* **connectors:** Adding Vagrant connector ([09dc0b6](https://github.com/ottomatica/opunit/commit/09dc0b6)), closes [#9](https://github.com/ottomatica/opunit/issues/9)
