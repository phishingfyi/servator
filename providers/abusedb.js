import axios from "axios";
import DNS from "./dns.js";

const endpoint = 'https://api.findabuse.email/api/v1'

const AbuseDB = {
    lookup: async(hostname) => {
        // Check the cache
        let cacheKey = `/abusedb/${Buffer.from(hostname).toString('base64')}`;
        global.db.get(cacheKey, function(err, reply) {
            if (reply) {
                return JSON.parse(reply)['data'];
            }
        });

        // Now we resolve the hostname
        let addr = [];
        let types = ['A', 'AAAA'];

        for (let r of types) {
            let dns = await DNS.lookup(hostname, r);
            addr = [...addr, ...dns];
        }

        // And lookup using abusedb
        const res = await axios.get(`${endpoint}/${addr.join(',')}`, {
            headers: {
                "User-Agent": "phishing.fyi/servator",
            },
        });
        let contacts = [];
        let data = (await res).data;

        for (let a of Object.keys(data)) {
            if (data[a]['success']) {
                contacts = [...data[a]['contacts']['abuse'], ...contacts];
            }
        }

        // Save to cache
        global.db.set(cacheKey, JSON.stringify({
            'data': [...new Set(contacts)]
        }));
        global.db.expire(cacheKey, global.config['ttl']);

        return [...new Set(contacts)];
    },
};

export default AbuseDB;