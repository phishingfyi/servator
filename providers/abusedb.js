import axios from "axios";

const endpoint = 'https://api.findabuse.email/api/v1'

const AbuseDB = {
    lookup: async(addr) => {
        // Check the cache
        let cacheKey = `/abusedb/${Buffer.from(addr).toString('base64')}`;
        global.db.get(cacheKey, function(err, reply) {
            if (reply) {
                return JSON.parse(reply)['data'];
            }
        });

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