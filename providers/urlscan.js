import axios from "axios";

const endpoint = "https://urlscan.io/api/v1";

const Urlscan = {
    lookup: async(token, url, visibility = 'unlisted', tags = 'phishing.fyi') => {
        let payload = {
            'url': url,
            'visibility': visibility,
            'tags': tags.split(',')
        };
        const res = await axios.post(`${endpoint}/scan`, payload, {
            headers: {
                'API-Key': token,
                'Content-Type': 'application/json'
            },
        });
        let data = (await res).data;
        return data;
    },
};

export default Urlscan;