const Ansible = require('../harness/ansible'); // TODO: This is from the old code, should add ansible.js

class IdempotencyCheck {
    constructor() {
        this.ansible = new Ansible();
    }

    async check(context, args) {
        return this.verifyIdempotency(context.hw, context.hw_path, context.autogradeYML);
    }

    async verifyIdempotency(hw, hw_path, autogradeYML) {
        let outputOne =  await this.ansible.playbook(hw_path, autogradeYML, false);
        let outputTwo =  await this.ansible.playbook(hw_path, autogradeYML, false);

        let hosts = [];
        for (let host of autogradeYML.ansible_hosts) {
            let server = `${hw.id}-${host}`;
            let changedOne = outputOne.stats[server].changed;
            let changedTwo = outputTwo.stats[server].changed;
            let status = changedTwo === 0;
            hosts.push({ host, idempotent: status, summary: outputTwo.stats[server] });
        }
        return hosts;
    }

    async report(results) {
        console.log(`Idempotent status: ${JSON.stringify(results)}`);
    }
}

// Export factory class
module.exports = IdempotencyCheck;
