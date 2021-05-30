import express from "express";
import validator from "validator";

import AbuseDB from "../providers/abusedb.js";
import DNS from "../providers/dns.js";
import Http from "../providers/http.js";
import IpApi from "../providers/ipapi.js";
import IpInfo from "../providers/ipinfo.js";
import Urlscan from "../providers/urlscan.js";

var router = express.Router();

/* GET users listing. */
router.post('/submit', async function(req, res, next) {
    let body = {
        'success': false
    };
    let checks = req.body.checks || 'dns,abusedb,urlscan';
    checks = checks.split(',');

    // Have they submitted a URL?
    let target = req.body.url || false;
    if (target == false) {
        body['message'] = "You must provide a URL to analyse";
        res.json(body);
    }

    // If they have, is it valid?
    if (!validator.isURL(target, { protocols: ['http', 'https'], require_protocol: true })) {
        body['message'] = `${target} does not appear to be a valid URL, or the protocol is not allowed`;
        res.json(body);
    }

    // Got this far, so add it to the response
    body['target'] = {};
    body['target']['url'] = target;
    body['target']['hostname'] = new URL(target).hostname;

    // What about getting the HTTP response
    if (checks.includes('http')) {
        let http = await Http.lookup(body["target"]["url"]);
        body['http'] = http;
    }

    // Now, let's do a DNS lookup (unless not specified)
    if (checks.includes('dns')) {
        let dns = await DNS.fetch(body["target"]["hostname"]);
        body['dns'] = dns;
    }

    // Now, let's do a scan with findabuse.email (unless not specified)
    if (checks.includes('abusedb')) {
        let abusedb = await AbuseDB.lookup(body["target"]["hostname"]);
        body['abusedb'] = abusedb;
    }

    // Now, let's do a scan with urlscan.io (unless not specified)
    if (checks.includes('urlscan')) {
        if (!global.config['urlscan'] == '') {
            let urlscan = await Urlscan.lookup(global.config['urlscan'], body["target"]["url"]);
            body['urlscan'] = urlscan;
        };
    }

    // Now, let's do a scan with ip-api.com (unless not specified)
    if (checks.includes('ipapi')) {
        if (!global.config['ipapi'] == '') {
            let ipapi = await IpApi.lookup(body["target"]["hostname"]);
            body['ipapi'] = ipapi;
        };
    }

    // Now, let's do a scan with ipinfo.io (unless not specified)
    if (checks.includes('ipinfo')) {
        let ipinfo = await IpInfo.lookup(body["target"]["hostname"]);
        body['ipinfo'] = ipinfo;
    }

    // And respond
    body['success'] = true;
    res.json(body);
});

export default router;