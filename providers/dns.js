import axios from "axios";
import validator from "validator";

const servers = [
    "https://dns.google.com/resolve",
    "https://cloudflare-dns.com/dns-query",
];

const DNS = {
    fetch: async(hostname) => {
        let rrtypes = ['A', 'AAAA'];
        let res = []
        for (let r of rrtypes) {
            let dns = await DNS.lookup(hostname, r);
            res = [...res, ...dns];
        }
        return res;
    },
    lookup: async(hostname, rrtype = "A") => {
        // Check the cache
        let cacheKey = `/dns/${Buffer.from(hostname).toString('base64')}/${rrtype}`;
        global.db.get(cacheKey, function(err, reply) {
            if (reply) {
                return JSON.parse(reply)['data'];
            }
        });

        let endpoint = servers[Math.floor(Math.random() * servers.length)];
        const res = await axios.get(endpoint, {
            params: {
                name: hostname,
                type: rrtype,
            },
            headers: {
                Accept: "application/dns-json",
            },
        });
        let rec = [];
        let data = (await res).data;

        for (let a of data.Answer) {
            if (validator.isIP(a['data'])) {
                rec.push(a['data']);
            }
        }

        // Save to cache
        global.db.set(cacheKey, JSON.stringify({
            'data': rec
        }));
        global.db.expire(cacheKey, global.config['ttl']);

        return rec;
    },
};

export default DNS;