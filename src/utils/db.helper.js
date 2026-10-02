import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export class DBHelper {
  /**
   * Thực thi câu lệnh SQL trực tiếp
   * @param {string} queryText
   * @param {Array} params
   */
  static async query(queryText, params = []) {
    const client = await pool.connect();
    console.log("Connect db successfully!");
    try {
      const res = await client.query(queryText, params);
      return res;
    } finally {
      client.release();
    }
  }

  /**
   * Lấy thông tin User theo Email
   */
  static async getUserByEmail(email) {
    const res = await this.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return res.rows[0];
  }

  /**
   * Dọn dẹp/Xóa data sau khi test
   */
  static async deleteUserByEmail(email) {
    await this.query("DELETE FROM users WHERE email = $1", [email]);
  }

  /**
   * Đóng toàn bộ kết nối khi xong
   */
  static async closePool() {
    await pool.end();
  }
}
