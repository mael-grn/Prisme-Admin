import {neon, NeonQueryFunction} from "@neondatabase/serverless";

export default class SqlUtil {
    private static sql : NeonQueryFunction<false, false>
    static getSql() {
        if (!this.sql) {
            this.sql = neon(`${process.env.DATABASE_URL}`);
        }
        return this.sql;
    }
}