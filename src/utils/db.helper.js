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
<<<<<<< Updated upstream
=======
   * Lấy thông tin chi tiết 1 Model/Gacha theo ID (chưa bị xóa)
   * @param {number|string} id
   */
  static async getGachaById(id) {
    const res = await this.query(
      "SELECT * FROM public.three_d_models WHERE id = $1 AND is_deleted = false",
      [id]
    );
    return res.rows[0];
  }

  /**
   * Lấy danh sách Model/Gacha kèm phân trang và lọc dữ liệu (chưa bị xóa, tương ứng với logic API)
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.itemsPerPage=10]
   * @param {string} [options.keyword=""]
   * @param {number} [options.status=null]
   */
  static async getGachaList({ page = 1, itemsPerPage = 10, keyword = "", status = null } = {}) {
    const offset = (Number(page) - 1) * Number(itemsPerPage);
    const conditions = ["is_deleted = false", "(image_filename ILIKE '%.png' OR image_path ILIKE '%.png')"];
    const params = [];

    if (status !== null && status !== undefined && status !== "") {
      params.push(Number(status));
      conditions.push(`status = $${params.length}`);
    }

    if (keyword && String(keyword).trim() !== "") {
      params.push(`%${String(keyword).trim()}%`);
      conditions.push(`name ILIKE $${params.length}`);
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Đếm tổng số bản ghi chưa bị xóa
    const countQuery = `SELECT COUNT(*)::int AS total FROM public.three_d_models ${whereClause}`;
    const countRes = await this.query(countQuery, params);
    const totalCount = countRes.rows[0]?.total || 0;

    // Lấy danh sách bản ghi theo thứ tự id DESC
    const queryParams = [...params, Number(itemsPerPage), offset];
    const dataQuery = `
      SELECT *
      FROM public.three_d_models
      ${whereClause}
      ORDER BY id DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length}
    `;
    const dataRes = await this.query(dataQuery, queryParams);

    return {
      totalCount,
      rows: dataRes.rows,
    };
  }

  /**
>>>>>>> Stashed changes
   * Đóng toàn bộ kết nối khi xong
   */
  static async closePool() {
    await pool.end();
  }
}
