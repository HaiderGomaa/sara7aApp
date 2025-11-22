export function corsOptions() {
    const whiteLists = process.env.WHITELISTED_DOMAINS
        ? process.env.WHITELISTED_DOMAINS.split(",")
        : [];
    const corsOptions={
        origin: function (origin, callback) {
            // allow requests with no origin (like mobile apps or curl requests)
            if (!origin) return callback(null, true);
            if (whiteLists.indexOf(origin) !== -1) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",

    }
    return corsOptions;

}