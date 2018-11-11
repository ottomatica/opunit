# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
