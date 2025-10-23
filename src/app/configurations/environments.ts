import dotenv from "dotenv";

dotenv.config();

interface LoadEnvVariableProps {
  port: string;
  db_url: string;
  node_env: "development" | "production";
  bcrypt_salt_round: number;
  express_session_secret: string;
  frontend_base_url: string;
  jwt: {
    access_secret: string;
    access_secret_expires_in: string;
    refresh_secret: string;
    refresh_secret_expires_in: string;
  };
  super_admin: {
    email: string;
    password: string;
  };
  google_authentication: {
    client_id: string;
    client_secret: string;
    callback_url: string;
  };
  cookie: {
    access: string;
    refresh: string;
  };
  redis: {
    user: string;
    password: string;
    port: number;
    host: string;
  };
  smtp: {
    pass: string;
    user: string;
    from: string;
    host: string;
    port: number;
  };
}

const loadEnvVariables = (): LoadEnvVariableProps => {
  const requiredEnvVariables: string[] = [
    "PORT",
    "DB_URL",
    "NODE_ENV",
    "BCRYPT_SALT_ROUND",
    "EXPRESS_SESSION_SECRET",
    "FRONTEND_BASE_URL",

    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_SECRET_EXPIRES_IN",
    "JWT_REFRESH_SECRET",
    "TWT_REFRESH_SECRET_EXPIRES_IN",

    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_CALLBACK_URL",

    "SUPER_ADMIN_EMAIL",
    "SUPER_ADMIN_PASSWORD",

    "ACCESS_COOKIE_NAME",
    "REFRESH_COOKIE_NAME",

    "REDIS_USER",
    "REDIS_PASSWORD",
    "REDIS_PORT",
    "REDIS_HOST",

    "SMTP_PASS",
    "SMTP_USER",
    "SMTP_FROM",
    "SMTP_HOST",
    "SMTP_PORT",
  ];
  requiredEnvVariables.forEach((key: string) => {
    if (!process.env[key]) {
      throw new Error(key + " environment variable is missing 🐞");
    }
  });
  return {
    port: process.env.PORT as string,
    db_url: process.env.DB_URL as string,
    node_env: process.env.NODE_ENV as "development" | "production",
    bcrypt_salt_round: Number(process.env.BCRYPT_SALT_ROUND) as number,
    express_session_secret: process.env.EXPRESS_SESSION_SECRET as string,
    frontend_base_url: process.env.FRONTEND_BASE_URL as string,

    jwt: {
      access_secret: process.env.JWT_ACCESS_SECRET as string,
      access_secret_expires_in: process.env
        .JWT_ACCESS_SECRET_EXPIRES_IN as string,
      refresh_secret: process.env.JWT_REFRESH_SECRET as string,
      refresh_secret_expires_in: process.env
        .TWT_REFRESH_SECRET_EXPIRES_IN as string,
    },
    google_authentication: {
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      callback_url: process.env.GOOGLE_CALLBACK_URL as string,
    },
    super_admin: {
      email: process.env.SUPER_ADMIN_EMAIL as string,
      password: process.env.SUPER_ADMIN_PASSWORD as string,
    },
    cookie: {
      access: process.env.ACCESS_COOKIE_NAME as string,
      refresh: process.env.REFRESH_COOKIE_NAME as string,
    },
    redis: {
      host: process.env.REDIS_HOST as string,
      password: process.env.REDIS_PASSWORD as string,
      port: Number(process.env.REDIS_PORT) as number,
      user: process.env.REDIS_USER as string,
    },
    smtp: {
      from: process.env.SMTP_FROM as string,
      host: process.env.SMTP_HOST as string,
      pass: process.env.SMTP_PASS as string,
      port: Number(process.env.SMTP_PORT) as number,
      user: process.env.SMTP_USER as string,
    },
  };
};

export default { ...loadEnvVariables() } as LoadEnvVariableProps;
