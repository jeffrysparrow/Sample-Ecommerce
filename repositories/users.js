const fs = require("fs");
const crypto = require("crypto");

class UsersRepository {
  // reminder constructors are run immediately upon new instance of class
  constructor(filename) {
    if (!filename) {
      throw new Error("creating a repository requires a filename");
    }

    // check if file already exists
    this.filename = filename;
    try {
      fs.accessSync(this.filename);
    } catch (err) {
      // if file doesnt exist create it with an empty array in the file
      fs.writeFileSync(this.filename, "[]");
    }
  }

  async getAll() {
    // open the file called this.filename
    return JSON.parse(
      await fs.promises.readFile(this.filename, {
        encoding: "utf8",
      })
    );
  }

  async create(attrs) {
    attrs.id = this.randomID();
    const records = await this.getAll();
    records.push(attrs);
    // write the updated 'records' array back to this.filename (users.json)
    await this.writeAll(records);

    return attrs;
  }

  async writeAll(records) {
    await fs.promises.writeFile(
      this.filename,
      JSON.stringify(records, null, 2)
    );
  }

  randomID() {
    return crypto.randomBytes(4).toString("hex");
  }

  async getOne(id) {
    const records = await this.getAll();
    return records.find((record) => record.id === id);
  }

  async delete(id) {
    const records = await this.getAll();
    const filteredRecords = records.filter((record) => record.id !== id);
    await this.writeAll(filteredRecords);
  }

  async update(id, attrs) {
    const records = await this.getAll();
    const record = records.find((record) => record.id === id);

    if (!record) {
      throw new Error(`Record with id ${id} not found`);
    }

    Object.assign(record, attrs);
    await this.writeAll(records);
  }

  async getOneBy(filters) {
    const records = await this.getAll();
    // for OF loop because looping through array
    for (let record of records) {
      let found = true;
      // for IN loop because looping thourgh object and comparying keys
      for (let key in filters) {
        if (record[key] !== filters[key]) {
          found = false;
        }
      }

      if (found) {
        return record;
      }
    }
  }
}

module.exports = new UsersRepository("users.json");
// we really only need one instance of usersrepository
// IN ANOTHER FILE we can now
// const repo = require(./users)
// repo.getAll() etc

// one option with some potential issues
// module.exports = UsersRepository;

// // IN ANOTHER FILE
// const UsersRepository = require("./users");
// const repo = new UsersRepository("users.json");
// // Yet ANOTHER FILE
// // COULD EASILY MISTYPE USER.JSON OR SOMETHING
