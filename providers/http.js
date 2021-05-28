import axios from "axios";

const Http = {
    lookup: async(url) => {
        // Check the cache
        let cacheKey = `/http/${Buffer.from(url).toString('base64')}`;
        global.db.get(cacheKey, function(err, reply) {
            if (reply) {
                return JSON.parse(reply)['data'];
            }
        });

        const res = await axios.get(url, {
            headers: {
                "User-Agent": "phishing.fyi/servator",
            },
        });
        let data = (await res).data;

        // Save to cache
        global.db.set(cacheKey, JSON.stringify({
            'data': data
        }));
        global.db.expire(cacheKey, global.config['ttl']);

        return Buffer.from(data).toString('base64');
    },
};

export default Http;