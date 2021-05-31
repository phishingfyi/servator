import axios from "axios";
import DNS from "./dns.js";

const endpoint = 'https://api.spur.us/v1'

const Spur = {
    lookup: async(hostname) => {
        // Check the cache
        let cacheKey = `/spur/${Buffer.from(hostname).toString('base64')}`;
        global.db.get(cacheKey, function(err, reply) {
            if (reply) {
                return JSON.parse(reply);
            }
        });

        // Now we resolve the hostname
        let addr = [];
        let types = ['A', 'AAAA'];

        for (let r of types) {
            let dns = await DNS.lookup(hostname, r);
            addr = [...addr, ...dns];
        }

        // And lookup using spur.us
        let out = {};

        if (addr.length > 0) {
            for (let i of addr) {
                let res = await axios.get(`${endpoint}/context/${i}`, {
                    headers: {
                        "User-Agent": "phishing.fyi/servator",
                        "Accept": "application/json",
                        "Token": global.config['spur']
                    }
                })
                res = (await res).data;
                out[i] = res;
            }
        }

        // Save to cache
        global.db.set(cacheKey, JSON.stringify(out));
        global.db.expire(cacheKey, global.config['ttl']);

        return out;
    },
};

export default Spur;