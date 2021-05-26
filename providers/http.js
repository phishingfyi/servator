import axios from "axios";

const Http = {
    lookup: async(url) => {
        const res = await axios.get(url, {
            headers: {
                "User-Agent": "phishing.fyi/servator",
            },
        });
        let data = (await res).data;
        return Buffer.from(data).toString('base64');
    },
};

export default Http;