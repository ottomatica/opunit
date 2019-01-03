const Docker = require('dockerode');
const stream = require('stream');
const chalk  = require('chalk');

class DockerConnector {
    constructor(container) {
        this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
        this.containerId = container;
    }

    async pull(imageName) {
        let self = this;
        // console.log( `pulling ${imageName}`);
        process.stdout.write(`pulling ${imageName} `);
        return new Promise((resolve, reject) => {
            self.docker.pull(imageName, (error, stream) => {
                self.docker.modem.followProgress(stream, (error, output) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    process.stdout.write('... pulled\n');
                    resolve(output);
                }, event => console.log(event));
            });
        });
    }

    async setup(_context, _setup) {
        // TODO:
    }

    async getContainerIp(context) {
        const container = this.docker.getContainer(context.name);
        const data = await container.inspect();
        return data.NetworkSettings.IPAddress;
    }

    async run(image, cmd, name) {
        await this.docker.createContainer({
            name,
            Image: image,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: Array.isArray(cmd) ? cmd : [cmd],
            OpenStdin: false,
            StdinOnce: false,
        }).then(container => container.start());
    }

    async ready() {
        const containerExists = await this.containerExists();

        if (!containerExists) throw Error(`Container isn't ready: ${this.containerId}`);
    }

    async containerExists() {
        let containerExists = false;
        try {
            let runningContainers = await this.docker.listContainers({ all: false });
            containerExists = runningContainers.filter(container => container.Id.includes(this.containerId) || container.Names.includes(`/${this.containerId}`)).length > 0;
        } catch (err) {
            console.error(chalk.red(' => Docker is not running so can\'t check for any matching containers.'));
        }
        return containerExists;
    }

    async exec(context, cmd) {
        const self = this;
        return new Promise(((resolve, reject) => {
            let options = {
                Cmd: ['bash', '-c', cmd],
                // Cmd: ['bash', '-c', 'echo test $VAR'],
                // Env: ['VAR=ttslkfjsdalkfj'],
                AttachStdout: true,
                AttachStderr: true,
            };
            let container = self.docker.getContainer(self.containerId);
            let logStream = new stream.PassThrough();

            let output = '';
            logStream.on('data', (chunk) => {
                // console.log(chunk.toString('utf8'));
                output += chunk.toString('utf8');
            });

            container.exec(options, (err, exec) => {
                if (err) return;
                exec.start((err, stream) => {
                    if (err) return;

                    container.modem.demuxStream(stream, logStream, logStream);
                    stream.on('end', () => {
                        logStream.destroy();
                        resolve(output);
                    });

                    // exec.inspect(function(err, data) {
                    //     if (err) return;
                    //     console.log(data);
                    // });
                });
            });
        }));
    }
}

// Export factory class
module.exports = DockerConnector;
