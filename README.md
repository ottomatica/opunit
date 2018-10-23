# Opunit🕵️‍
Simple tool for doing sanity checks on vms, and containers and remote servers. Written in pure node.js


## Install from source
```
git clone https://github.com/ottomatica/opunit
cd opunit
npm install
npm link
```


## Using Opunit
Opunit uses a configuration file (opunit.yml) in the `/test` directory of you project. This is an example opunit.yml file. By running `opunit verify` in the root directory of your project, opunit runs the checks defined in the configuration file on the [Baker](https://github.com/ottomatica/Baker) environment of your project.

``` yml
- hostgroup:
    checks:
      - availability:
          port: 8080
          status: 200
          url: /
          setup: 
            cmd: baker run serve
            wait_for: Started Application
      - version:          
         cmd: mysql --version
         range: ^8.x.x
      - version:          
         cmd: java -version
         range: ^1.8.x
```

In this example opunit will run 3 checks. First one runs Baker command `baker run serve` and waits for "Started Application", then checks the reponse status for a request to `http://{Baker VM IP}/`. 
The next two checks run `--version` commands for MySQL and Java inside the Baker environment and compare the actual version with the provided [semver range](https://semver.org).
If all the checks pass, the output of opunit will look like this:

```
Checks

        availability check
        Setup: baker run serve
        Resolved wait_for condition: Stdout matches "Started Application"
        Tearing down
            ✔   [hibernate-spring] http://192.168.8.8:8080// expected: 200 actual: 200
        version check
            ✔   mysql --version: 8.0.12 > ^8.x.x => true
        version check
            ✔   java -version: 1.8.0 > ^1.8.x => true

Summary

        100.0% of all checks passed.
        3 passed · 0 failed
```

More examples of using Opunit can be found in Baker environments of [baker-examples](https://github.com/ottomatica/baker-examples) repository.

## Connectors
Opunit has different connectors to be able to run checks on different kinds of environments.

### Baker Connector
If you don't specify any, Opunit will use Baker connector by default; for example if opunit is run as:
``` shell
$ opunit verify {project path} -c {opunit.yml path}
```
By default, Opunit uses current working directory as `{project directory}`, and checks `/test/opunit.yml` of the project directory if nothing is specified. So, Opunit can be run from the root directory of a project that uses Baker, by running `opunit verify`.

### ssh Connector
If you use `-i` or `--ssh_key` option when running `opunit` command, Opunit will use the ssh connector. When using this connector, you must also use `use@hostname:port` (or `user@hostname` if using the default ssh port 22) format for the environment path:
```
$ opunit verify root@example.com:2222 -c {opunit.yml path} -i ~/.ssh/baker_rsa
```
Similar to the other connectors, if you are running the command from the project directory which contains `/test/opunit.yml`, you can run opunit without specifying `-c {opunit.yml path}`.

### docker Connector
If you use `-t` or `--container` option when running `opunit` command, Opunit will use the Docker connector.
```
$ opunit verify -c {opunit.yml path} -t {docker container name or id}
```
Similar to the other connectors, if you are running the command from the project directory which contains `/test/opunit.yml`, you can run opunit without specifying `-c {opunit.yml path}`.