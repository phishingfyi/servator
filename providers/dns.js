import axios from "axios";
import validator from "validator";

const servers = [
    "https://dns.google.com/resolve",
    "https://cloudflare-dns.com/dns-query",
];

const DNS = {
    lookup: async(hostname, rrtype = "A") => {
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
        return rec;
    },
};

export default DNS;