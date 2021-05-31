import axios from "axios";

const endpoint = "https://urlscan.io/api/v1";

const Urlscan = {
    lookup: async(url, visibility = 'unlisted', tags = 'phishing.fyi') => {
        // Check the cache
        let cacheKey = `/urlscan/${Buffer.from(url).toString('base64')}`;
        global.db.get(cacheKey, function(err, reply) {
            if (reply) {
                return JSON.parse(reply)['data'];
            }
        });

        let payload = {
            'url': url,
            'visibility': visibility,
            'tags': tags.split(',')
        };
        const res = await axios.post(`${endpoint}/scan`, payload, {
            headers: {
                'API-Key': global.config['urlscan'],
                'Content-Type': 'application/json'
            },
        });
        let data = (await res).data;

        // Save to cache
        global.db.set(cacheKey, JSON.stringify(data));
        global.db.expire(cacheKey, global.config['ttl']);

        return data;
    },
};

export default Urlscan;