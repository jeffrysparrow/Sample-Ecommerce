const fs = require("fs");
const crypto = require("crypto");
const util = require("util");
const Repository = require("./repository");

const scrypt = util.promisify(crypto.scrypt);

class UsersRepository extends Repository {
  async create(attrs) {
    attrs.id = this.randomID();

    const salt = crypto.randomBytes(8).toString("hex");
    const buf = await scrypt(attrs.password, salt, 64);
    const records = await this.getAll();
    const record = {
      ...attrs,
      password: `${buf.toString("hex")}.${salt}`,
    };
    records.push(record);
    // write the updated 'records' array back to this.filename (users.json)
    await this.writeAll(records);

    return record;
  }

  async comparePasswords(saved, supplied) {
    // saved = password saved in database. 'hashed.salt'
    // supplied = password given to us by user trying to sign in
    // const result = saved.split(".");
    // const hashed = result[0];
    // const salt = result[1];

    // refactored to 1 line using destructuring
    const [hashed, salt] = saved.split(".");
    const hashedSuppliedBuf = await scrypt(supplied, salt, 64);

    return hashed === hashedSuppliedBuf.toString("hex");
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
