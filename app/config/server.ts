import md5 from "spark-md5";
import mysql from 'mysql';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      OPENAI_API_KEY?: string;
      CODE?: string;
      BASE_URL?: string;
      PROXY_URL?: string;
      VERCEL?: string;
      HIDE_USER_API_KEY?: string; // disable user's api key input
      DISABLE_GPT4?: string; // allow user to use gpt-4 or not
      BUILD_MODE?: "standalone" | "export";
      BUILD_APP?: string; // is building desktop app
      HIDE_BALANCE_QUERY?: string; // allow user to query balance or not
    }
  }
}

const getAccessCodes = async (): Promise<Set<string>> => {
  return new Promise((resolve, reject) => {
    // 创建数据库连接
    const connection = mysql.createConnection({
      host: 'bj-cdb-***.sql.***.com',
      port: ***,
      user: '****',
      password: '***',
      database: 'zheyuai'
    });

    // 执行查询语句获取数据
    connection.query('SELECT user_name FROM user_info', (error, results) => {
      if (error) {
        console.error('Error retrieving user names from database:', error);
        // 返回空的 Set
        resolve(new Set());
      }

      console.log("[results] results:", results); // 打印查询结果

      // 将结果组织成数组
      const userNames = results.map((row) => md5.hash(row.user_name));
      
      // 关闭数据库连接
      connection.end();

      resolve(new Set(userNames));
    });
  });
};

export const getServerSideConfig = async () => {
  if (typeof process === "undefined") {
    throw Error(
      "[Server Config] you are importing a nodejs-only module outside of nodejs",
    );
  }

  const ACCESS_CODES = await getAccessCodes();

  return {
    apiKey: process.env.OPENAI_API_KEY,
    code: process.env.CODE,
    codes: ACCESS_CODES,
    needCode: ACCESS_CODES.size > 0,
    baseUrl: process.env.BASE_URL,
    proxyUrl: process.env.PROXY_URL,
    isVercel: !!process.env.VERCEL,
    hideUserApiKey: !!process.env.HIDE_USER_API_KEY,
    disableGPT4: !!process.env.DISABLE_GPT4,
    hideBalanceQuery: !!process.env.HIDE_BALANCE_QUERY,
    enableGPT4: !process.env.DISABLE_GPT4,
  };
};
