import axios from "axios";
import DNS from "./dns.js";

const endpoint = 'https://pro.ip-api.com';

const IpApi = {
    lookup: async(hostname) => {
        // Check the cache
        let cacheKey = `/ipapi/${Buffer.from(hostname).toString('base64')}`;
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

        // And lookup using ip-api
        const res = await axios.post(`${endpoint}/batch`, JSON.stringify(addr), {
            params: {
                "fields": "268169215",
                "key": global.config['ipapi']
            },
            headers: {
                "User-Agent": "phishing.fyi/servator",
                "Accept": "application/json",
                "Content-Type": "application/json"
            },

        });
        let data = (await res).data;

        // Save to cache
        global.db.set(cacheKey, JSON.stringify({
            'data': data
        }));
        global.db.expire(cacheKey, global.config['ttl']);

        return data;
    },
};

export default IpApi;