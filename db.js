const sqlite3 = require('sqlite3').verbose();

class AppDAO {
  constructor(dbFilePath) {
    this.db = new sqlite3.Database(dbFilePath, (err) => {
      err ? console.error(err.message) : console.log('Connected to database');
    });
  }
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          console.log('Error running sql: ' + sql);
          console.error(err.message);
          reject(err);
        } else {
          resolve({ id: this.lastID });
        }
      });
    });
  }
  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, result) => {
        if (err) {
          console.log('Error running sql: ' + sql);
          console.error(err.message);
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }
  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.log('Error running sql: ' + sql);
          console.error(err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }
}

class UrlRepo {
  constructor(dao) {
    this.dao = dao;
  }
  createTable() {
    return this.dao.run(`CREATE TABLE IF NOT EXISTS url_map_table (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_url TEXT)`);
  }
  create($url) {
    return this.dao.run(`INSERT INTO url_map_table (original_url) VALUES (?)`, [
      $url
    ]);
  }
  update($id, $url) {
    return this.dao.run(
      `UPDATE url_map_table SET original_url = ? WHERE id = ?`,
      [$url, $id]
    );
  }
  delete($id) {
    return this.dao.run(`DELETE FROM url_map_table WHERE id = ?`, [$id]);
  }
  getById($id) {
    return this.dao.get(`SELECT * FROM url_map_table WHERE id = ?`, [$id]);
  }
  getByURL($url) {
    return this.dao.get(`SELECT * FROM url_map_table WHERE original_url = ?`, [
      $url
    ]);
  }
  getAll() {
    return this.dao.all(`SELECT * FROM url_map_table`);
  }
}

module.exports = { AppDAO: AppDAO, UrlRepo: UrlRepo };
