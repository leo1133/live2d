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
   * Kiểm tra trạng thái kết nối Database (Health check)
   * @returns {Promise<boolean>}
   */
  static async isConnected() {
    try {
      const client = await pool.connect();
      client.release();
      return true;
    } catch (e) {
      console.warn(`⚠️ [DB] Database không khả dụng: ${e.message}`);
      return false;
    }
  }

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
   * Lấy chi tiết 1 User cho màn Quản lý người dùng theo ID (đầy đủ các trường định danh, agency, streamer type, stats, sales, ekyc)
   * @param {number|string} userId
   */
  static async getUserManagementById(userId) {
    const queryText = `
      SELECT 
        -- 1. Thông tin định danh cơ bản của User
        u.id,
        u.code,
        u.display_name,
        u.status,

        -- 2. Agency (Lấy agency mới nhất của user)
        (SELECT a.name 
         FROM agency_member am JOIN agency a ON a.id = am.agency_id 
         WHERE am.user_id = u.id AND NOT am.is_deleted 
         ORDER BY COALESCE(am.deleted_at, am.created_at) DESC LIMIT 1) AS agency_name,

        -- 3. Cài đặt loại Streamer
        (SELECT fs.value 
         FROM familia f JOIN familia_setting fs ON fs.familia_id = f.id 
         WHERE f.owner_id = u.id AND fs.key = 'streamer_type' AND NOT f.is_deleted 
         ORDER BY fs.created_at DESC LIMIT 1) AS streamer_type,

        -- 4. Chỉ số tương tác (Social counts)
        (SELECT count(*) FROM user_follows WHERE follower_id = u.id) AS following_count,
        (SELECT count(*) FROM user_follows WHERE followed_id = u.id) AS follower_count,
        (SELECT count(*) FROM user_likes WHERE target_user_id = u.id AND NOT is_deleted) AS livestream_like_count,

        -- 5. Thời lượng & Lần cuối Livestream
        (SELECT sum(s.duration) 
         FROM streams s JOIN rooms r ON r.id = s.room_id 
         WHERE r.user_id = u.id AND NOT s.is_deleted) AS total_stream_duration,
        (SELECT max(started_at) 
         FROM streams s JOIN rooms r ON r.id = s.room_id 
         WHERE r.user_id = u.id AND NOT s.is_deleted) AS last_stream_at,

        -- 6. Lần cuối đăng nhập
        (SELECT max(login_date) FROM user_login_history WHERE user_id = u.id) AS last_login_at,

        -- 7. Doanh thu theo từng nguồn (Transactions)
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (1, 2)) AS gift_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (3, 4)) AS two_shot_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (5)) AS whisper_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (6)) AS yell_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (7)) AS familia_sales,

        -- 8. Trạng thái xác thực danh tính (eKYC)
        (SELECT auth_result FROM user_ekyc WHERE user_id = u.id) AS ekyc_status

      FROM users u
      WHERE NOT u.is_deleted AND u.id = $1
      LIMIT 1;
    `;
    const res = await this.query(queryText, [userId]);
    return res.rows[0] || null;
  }

  /**
   * Lấy danh sách User cho màn Quản lý người dùng kèm phân trang và bộ lọc
   * @param {Object} options
   * @param {number} [options.page=1]
   * @param {number} [options.itemsPerPage=10]
   * @param {string} [options.keyword=""]
   * @param {number} [options.status=null]
   * @param {number|string} [options.userId=null]
   */
  static async getUserManagementList({
    page = 1,
    itemsPerPage = 10,
    keyword = "",
    status = null,
    userId = null,
  } = {}) {
    const offset = (Number(page) - 1) * Number(itemsPerPage);
    const conditions = ["NOT u.is_deleted"];
    const params = [];

    if (userId !== null && userId !== undefined && userId !== "") {
      params.push(Number(userId));
      conditions.push(`u.id = $${params.length}`);
    }

    if (status !== null && status !== undefined && status !== "") {
      params.push(Number(status));
      conditions.push(`u.status = $${params.length}`);
    }

    if (keyword && String(keyword).trim() !== "") {
      const trimmedKeyword = String(keyword).trim();
      params.push(`%${trimmedKeyword}%`);
      const kwIdx = params.length;
      conditions.push(
        `(u.display_name ILIKE $${kwIdx} OR u.code ILIKE $${kwIdx} OR CAST(u.id AS TEXT) ILIKE $${kwIdx})`
      );
    }

    const whereClause = `WHERE ${conditions.join(" AND ")}`;

    // Đếm tổng số bản ghi chưa bị xóa
    const countQuery = `SELECT COUNT(*)::int AS total FROM users u ${whereClause}`;
    const countRes = await this.query(countQuery, params);
    const totalCount = countRes.rows[0]?.total || 0;

    // Lấy danh sách bản ghi theo thứ tự u.id DESC
    const queryParams = [...params, Number(itemsPerPage), offset];
    const dataQuery = `
      SELECT 
        -- 1. Thông tin định danh cơ bản của User
        u.id,
        u.code,
        u.display_name,
        u.status,

        -- 2. Agency (Lấy agency mới nhất của user)
        (SELECT a.name 
         FROM agency_member am JOIN agency a ON a.id = am.agency_id 
         WHERE am.user_id = u.id AND NOT am.is_deleted 
         ORDER BY COALESCE(am.deleted_at, am.created_at) DESC LIMIT 1) AS agency_name,

        -- 3. Cài đặt loại Streamer
        (SELECT fs.value 
         FROM familia f JOIN familia_setting fs ON fs.familia_id = f.id 
         WHERE f.owner_id = u.id AND fs.key = 'streamer_type' AND NOT f.is_deleted 
         ORDER BY fs.created_at DESC LIMIT 1) AS streamer_type,

        -- 4. Chỉ số tương tác (Social counts)
        (SELECT count(*) FROM user_follows WHERE follower_id = u.id) AS following_count,
        (SELECT count(*) FROM user_follows WHERE followed_id = u.id) AS follower_count,
        (SELECT count(*) FROM user_likes WHERE target_user_id = u.id AND NOT is_deleted) AS livestream_like_count,

        -- 5. Thời lượng & Lần cuối Livestream
        (SELECT sum(s.duration) 
         FROM streams s JOIN rooms r ON r.id = s.room_id 
         WHERE r.user_id = u.id AND NOT s.is_deleted) AS total_stream_duration,
        (SELECT max(started_at) 
         FROM streams s JOIN rooms r ON r.id = s.room_id 
         WHERE r.user_id = u.id AND NOT s.is_deleted) AS last_stream_at,

        -- 6. Lần cuối đăng nhập
        (SELECT max(login_date) FROM user_login_history WHERE user_id = u.id) AS last_login_at,

        -- 7. Doanh thu theo từng nguồn (Transactions)
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (1, 2)) AS gift_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (3, 4)) AS two_shot_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (5)) AS whisper_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (6)) AS yell_sales,
        (SELECT sum(abs(amount)) FROM transactions WHERE target_user = u.id AND action_type IN (7)) AS familia_sales,

        -- 8. Trạng thái xác thực danh tính (eKYC)
        (SELECT auth_result FROM user_ekyc WHERE user_id = u.id) AS ekyc_status

      FROM users u
      ${whereClause}
      ORDER BY u.id DESC
      LIMIT $${queryParams.length - 1} OFFSET $${queryParams.length};
    `;
    const dataRes = await this.query(dataQuery, queryParams);

    return {
      totalCount,
      rows: dataRes.rows,
    };
  }

  /**
   * Đóng toàn bộ kết nối khi xong
   */
  static async closePool() {
    if (pool && !pool.ending) {
      try {
        await pool.end();
      } catch (e) {
        // Ignore already closed or unreachable errors
      }
    }
  }
}
