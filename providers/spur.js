import axios from "axios";
import DNS from "./dns.js";

const endpoint = 'https://api.spur.us/v1';

const Spur = {
    lookup: async(hostname) => {
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
                let cached = false;
                global.db.get(`/spur/${i}`, function(err, reply) {
                    if (reply) {
                        cached = true;
                        out[i] = JSON.parse(reply);
                    }
                });

                if (!cached) {
                    let res = await axios.get(`${endpoint}/context/${i}`, {
                        headers: {
                            "User-Agent": "phishing.fyi/servator",
                            "Accept": "application/json",
                            "Token": global.config['spur']
                        }
                    });
                    res = (await res).data;

                    // Save to cache
                    global.db.set(`/spur/${i}`, JSON.stringify(out));
                    global.db.expire(`/spur/${i}`, 604800);

                    out[i] = res;
                }
            };
            return out;
        };
    },
};

export default Spur;