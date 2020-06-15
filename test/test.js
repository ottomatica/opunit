const execSync = require('child_process').execSync;

describe('Opunit Tests', () => {

    const HOST = '192.168.33.10';
    let sshConfig = null;
    beforeAll(() => {
        execSync('chmod +x test/resources/init.sh && ./test/resources/init.sh', {stdio: 'inherit'});
        execSync('bakerx pull ottomatica/bakerx#images bionic-node', {stdio: 'inherit'});
        execSync(`bakerx run opunit-test-vm bionic-node --ip ${HOST} --memory 1024 --up test/resources/init.sh`, {stdio: 'inherit'});

        sshConfig = JSON.parse(execSync(`bakerx ssh-info opunit-test-vm --format json`).toString().trim());
    })

    afterAll(() => {
        // delete test vm
        execSync('bakerx delete vm opunit-test-vm');
        
        // delete test files
        execSync('rm /tmp/foo /tmp/foo.json /tmp/foo.yml /tmp/app.js');
    });

    test('Run opunit checks on localhost', () => {
        execSync('node index.js verify local -c test/resources/examples.yml', { stdio: 'inherit' });
    });

    test('Running opunit checks on a VM using ssh connector', () => {
        execSync(`node index.js verify ${sshConfig.user}@${HOST}:22 --ssh_key ${sshConfig.private_key} -c test/resources/examples.yml`, { stdio: 'inherit' });
    });

    test('Run opunit checks using inventory', () => {
        execSync(`node index.js verify -i test/resources/inventory.yml`, { stdio: 'inherit' });
    });

});
