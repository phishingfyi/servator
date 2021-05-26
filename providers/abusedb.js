import axios from "axios";

const endpoint = 'https://api.findabuse.email/api/v1'

const AbuseDB = {
    lookup: async(addr) => {
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
        return [...new Set(contacts)];
    },
};

export default AbuseDB;