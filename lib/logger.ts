const isDev = process.env.NODE_ENV === "development";

const logger = {
  info: (data: object, msg?: string) => {
    if (isDev) console.log("[INFO]", msg, JSON.stringify(data));
  },
  warn: (data: object, msg?: string) => {
    console.warn("[WARN]", msg, JSON.stringify(data));
  },
  error: (data: object, msg?: string) => {
    console.error("[ERROR]", msg, JSON.stringify(data));
  },
};

export default logger;