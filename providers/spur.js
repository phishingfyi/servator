import axios from "axios";
import DNS from "./dns.js";

const endpoint = 'https://api.spur.us/v1'

const Spur = {
    lookup: async(hostname) => {
        // Check the cache
        let cacheKey = `/spur/${Buffer.from(hostname).toString('base64')}`;

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
                global.db.get(`/spur/${i}`, function(err, reply) {
                    if (reply) {
                        out[i] = JSON.parse(reply);
                    } else {
                        let res = await axios.get(`${endpoint}/context/${i}`, {
                            headers: {
                                "User-Agent": "phishing.fyi/servator",
                                "Accept": "application/json",
                                "Token": global.config['spur']
                            }
                        })
                        res = (await res).data;

                        // Save to cache
                        global.db.set(cacheKey, JSON.stringify(out));
                        global.db.expire(cacheKey, 604800);

                        out[i] = res;
                    }
                });
            }
        }

        return out;
    },
};

export default Spur;