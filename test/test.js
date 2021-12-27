const execSync = require('child_process').execSync;


describe('Opunit Tests', () => {

    const HOST = '192.168.33.10';
    let sshConfig = null;

    const conn = null;

    beforeAll(() => {
        // execSync('chmod +x test/resources/init.sh && ./test/resources/init.sh', {stdio: 'inherit'});
        // execSync('bakerx pull bionic-node ottomatica/bakerx#images', {stdio: 'inherit'});
        // execSync(`bakerx run opunit-test-vm bionic-node --ip ${HOST} --memory 1024 --up test/resources/init.sh`, {stdio: 'inherit'});

        // sshConfig = JSON.parse(execSync(`bakerx ssh-info opunit-test-vm --format json`).toString().trim());
        // conn = require("infra.connectors").getConnector("docker", "opunit_test_container");

    })

    afterAll(() => {
        // delete test container
        // conn.delete();

        
        // delete test files
        // execSync('rm /tmp/foo /tmp/foo.json /tmp/foo.yml /tmp/app.js')
    });

    test('Run opunit checks on localhost', () => {
        execSync('node index.js verify local -c test/resources/examples.yml', { stdio: 'inherit' })
    });

    // test('Running opunit checks on a VM using ssh connector', () => {
    //     execSync(`node index.js verify ${sshConfig.user}@${HOST}:22 --ssh_key ${sshConfig.private_key} -c test/resources/examples.yml`, { stdio: 'inherit' });
    // });

    // test('Run opunit checks using inventory', () => {
    //     execSync(`node index.js verify -i test/resources/inventory.yml`, { stdio: 'inherit' });
    // });

});
