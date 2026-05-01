const { TextFile } = require('./lib_lowdb_adapters_TextFile.js');
class JSONFile {
    constructor(filename) {
        this.adapter = new TextFile(filename);
    }
    async read() {
        const data = await this.adapter.read();
        if (data === null) {
            return null;
        }
        else {
            return JSON.parse(data);
        }
    }
    write(obj) {
        return this.adapter.write(JSON.stringify(obj, null, 2));
    }
}
module.exports = { JSONFile };
