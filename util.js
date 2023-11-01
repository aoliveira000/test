const crypto = require('crypto');

const keyGen = (name, state) => {
    const id = 'trazi' + name + state;
    return crypto.createHash('md5').update(id).digest('hex');
}

module.exports = { keyGen };