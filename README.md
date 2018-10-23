# Opunit🕵️‍
Simple tool for doing sanity checks on vms, and containers and remote servers. Written in pure node.js


## Install from source
```
git clone https://github.com/ottomatica/opunit
cd opunit
npm install
npm link
```

<center>
<img width="801" alt="screen shot 2018-10-23 at 10 55 00" src="https://user-images.githubusercontent.com/9158546/47369653-29e20080-d6b2-11e8-8098-b64c59d282c6.png">
</center>

## Using Opunit
Opunit uses a configuration file (opunit.yml) in the `/test` directory of you project. This is an example opunit.yml file. By running `opunit verify` in the root directory of your project, opunit runs the checks defined in the configuration file on the [environment of your project](#connectors); this can be a VM, container or even a remote server.

``` yml
- group:
    description: "Basic checks for startup"
    checks:
      - availability:
          port: 8080
          status: 200
          url: /
          setup:
            cmd: node app.js
            wait_for: Started Application
      - version:          
         cmd: mysql --version
         range: ^8.x.x
      - version:          
         cmd: node --version
         range: ^10.x.x
```

In this example opunit will run 3 checks. First one runs the command `node app.js` and waits for "Started Application", then checks the reponse status for a request to `http://{IP}/`.
The next two checks run `--version` commands for MySQL and Java inside the environment and compare the actual version with the provided [semver range](https://semver.org).
If all the checks pass, the output of opunit will look like this:

```
Checks

        availability check
        Setup: node index.js
        Resolved wait_for condition: Stdout matches "Started Application"
        Tearing down
            ✔   [node-app] http://192.168.8.8:8080// expected: 200 actual: 200
        version check
            ✔   mysql --version: 8.0.12 > ^8.x.x => true
        version check
            ✔   node --version: 10.12.0 > ^10.x.x => true

Summary

        100.0% of all checks passed.
        3 passed · 0 failed
```

More examples of using Opunit can be found in Baker environments of [baker-examples](https://github.com/ottomatica/baker-examples) repository.

## Connectors
Opunit has different connectors to be able to run checks on different kinds of environments. See below for description of each one and how the can be used.

### ssh Connector
If you use `-i` or `--ssh_key` option when running `opunit` command, Opunit will use the ssh connector. When using this connector, you must also use `use@hostname:port` (or `user@hostname` if using the default ssh port 22) format for the environment path:
```
$ opunit verify root@example.com:2222 -c {opunit.yml path} -i ~/.ssh/baker_rsa
```
Similar to the other connectors, if you are running the command from the project directory which contains `/test/opunit.yml`, you can run opunit without specifying `-c {opunit.yml path}`.

### Baker Connector
If you don't specify any, Opunit will use [Baker](https://github.com/ottomatica/Baker) connector by default; for example if opunit is run as:
``` shell
$ opunit verify {project path} -c {opunit.yml path}
```
By default, Opunit uses current working directory as `{project directory}`, and checks `/test/opunit.yml` of the project directory if nothing is specified. So, Opunit can be run from the root directory of a project that uses Baker, by running `opunit verify`.

### docker Connector
If you use `-t` or `--container` option when running `opunit` command, Opunit will use the Docker connector.
```
$ opunit verify -c {opunit.yml path} -t {docker container name or id}
```
Similar to the other connectors, if you are running the command from the project directory which contains `/test/opunit.yml`, you can run opunit without specifying `-c {opunit.yml path}`.