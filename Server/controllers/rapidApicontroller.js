import https from 'https';

const upstreamRequest = (options, payload, res) => {
    const rapidReq = https.request({ ...options, timeout: 15000 }, (rapidRes) => {
        const chunks = [];
        let size = 0;
        rapidRes.on('data', (chunk) => {
            size += chunk.length;
            if (size > 1_000_000) return rapidReq.destroy(new Error("Upstream response too large"));
            chunks.push(chunk);
        });
        rapidRes.on('end', () => {
            const body = Buffer.concat(chunks).toString();
            res.status(rapidRes.statusCode >= 400 ? 502 : 200).type("application/json").send(body);
        });
    });
    rapidReq.on("timeout", () => rapidReq.destroy(new Error("Compiler request timed out")));
    rapidReq.on("error", () => {
        if (!res.headersSent) res.status(502).json({ success: false, message: "Compiler service is unavailable" });
    });
    if (payload) rapidReq.write(JSON.stringify(payload));
    rapidReq.end();
};

export const rapidApiDetailController = (req, res) => {
    const options = {
        method: 'GET',
        hostname: process.env.X_RAPID_HOST,
        port: null,
        path: '/about',
        headers: {
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            'X-RapidAPI-Host': process.env.X_RAPID_HOST
        }
    };

    upstreamRequest(options, null, res);
}

export const rapidApiCompileController = (req, res) => {
    const { language_id, source_code, stdin } = req.body;
    if (!Number.isInteger(language_id) || language_id < 1 || language_id > 200) return res.status(400).json({ success: false, message: "Invalid language" });
    if (typeof source_code !== "string" || !source_code || source_code.length > 200_000) return res.status(400).json({ success: false, message: "Source code is required and must be under 200 KB" });
    if (stdin !== undefined && (typeof stdin !== "string" || stdin.length > 20_000)) return res.status(400).json({ success: false, message: "Input must be under 20 KB" });
    const options = {
        method: 'POST',
        hostname: process.env.X_RAPID_HOST,
        port: null,
        path: '/submissions',
        headers: {
            'content-type': 'application/json',
            'Content-Type': 'application/json',
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            'X-RapidAPI-Host': process.env.X_RAPID_HOST
        }
    };
    upstreamRequest(options, { language_id, source_code, stdin: stdin || "" }, res);
}

export const rapidApiResultController = (req, res) => {
    const { id } = req.params;
    if (!/^[A-Za-z0-9-]{8,100}$/.test(id)) return res.status(400).json({ success: false, message: "Invalid submission ID" });
    const options = {
        method: 'GET',
        hostname: process.env.X_RAPID_HOST,
        port: null,
        path: `/submissions/${id}`,
        headers: {
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
            'X-RapidAPI-Host': process.env.X_RAPID_HOST
        }
    };
    upstreamRequest(options, null, res);
}
