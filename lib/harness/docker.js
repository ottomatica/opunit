const Docker = require('dockerode');
const stream = require('stream');

class DockerConnector {

    constructor() {
        this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
    }

    async pull(imageName) {
        let self = this;
        //console.log( `pulling ${imageName}`);
        process.stdout.write(`pulling ${imageName} `);
        return new Promise((resolve, reject) => {
            self.docker.pull(imageName, (error, stream) => {
                self.docker.modem.followProgress(stream, (error, output) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    process.stdout.write(`... pulled\n`);
                    resolve(output);
                }, (event) => console.log(event));
            });
        });
    }

    async setup(context, setup) {
        // TODO: 
    }

    async getContainerIp(context) {
        var container = this.docker.getContainer(context.name);
        let data = await container.inspect();
        return data.NetworkSettings.IPAddress;
    }

    async run(image, cmd, name) {
        await this.docker.createContainer({
            name: name,
            Image: image,
            AttachStdin: false,
            AttachStdout: true,
            AttachStderr: true,
            Tty: true,
            Cmd: Array.isArray(cmd) ? cmd : [cmd],
            OpenStdin: false,
            StdinOnce: false,
        }).then(function (container) {
            return container.start();
        });
    }

    async ready(){
        // TODO: check if the host is ready for ssh
        return;
    }

    async exec(context, cmd) {
        let name = context.bakerPath;
        let self = this;
        return new Promise(function (resolve, reject) {
            var options = {
                Cmd: ['bash', '-c', cmd],
                //Cmd: ['bash', '-c', 'echo test $VAR'],
                //Env: ['VAR=ttslkfjsdalkfj'],
                AttachStdout: true,
                AttachStderr: true
            };
            var container = self.docker.getContainer(name);
            var logStream = new stream.PassThrough();

            var output = "";
            logStream.on('data', function (chunk) {
                //console.log(chunk.toString('utf8'));
                output += chunk.toString('utf8');
            });

            container.exec(options, function (err, exec) {
                if (err) return;
                exec.start(function (err, stream) {
                    if (err) return;

                    container.modem.demuxStream(stream, logStream, logStream);
                    stream.on('end', function () {
                        logStream.destroy();
                        resolve(output);
                    });

                    // exec.inspect(function(err, data) {
                    //     if (err) return;
                    //     console.log(data);
                    // });
                });
            });
        });
    }

}

// Export factory class
module.exports = DockerConnector;
