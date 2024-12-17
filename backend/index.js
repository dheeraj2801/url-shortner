require('dotenv').config()
const express = require('express')
const redis = require('redis')
const shortid = require('shortid')
const cors = require('cors')
const HashRing = require('hashring');

const app = express()
app.use(express.json())
app.use(cors())

const redisClients = [
    redis.createClient({
        url: `redis://${process.env.REDIS_HOST_1}:${process.env.REDIS_PORT_1}`
      }),
      redis.createClient({
        url: `redis://${process.env.REDIS_HOST_2}:${process.env.REDIS_PORT_2}`
      }),
      redis.createClient({
        url: `redis://${process.env.REDIS_HOST_3}:${process.env.REDIS_PORT_3}`
      })
]

const redisNodes = {'redis1:6379': 0, 'redis2:6380': 1, 'redis3:6381': 2}

const ring = new HashRing(redisNodes);

function getRedisClient(key) {
    const node = ring.get(key)
    return redisClients[redisNodes[node]]
}

app.post('/shorten', async(req, res) => {
    const { url, ttl } = req.body
    if(!url) return res.status(400).send('Url is required')

    const shortId = shortid.generate()
    const redisClient = getRedisClient(shortId)
    await redisClient.set(shortId, url, 'EX', ttl || 3600) //Default TTL 1 hour
    res.json({ shortUrl: `http://localhost:${process.env.PORT}/${shortId}`})
})

app.get('/get-all-urls', async (req, res) => {
    try {
        let results = [];

        for (const client of redisClients) {
            const keys = await client.keys('*'); // Get all keys
            if (keys.length > 0) {
                const values = await client.mGet(keys); // Get corresponding values
                const data = keys.map((key, i) => ({
                    shortenUrl: `http://localhost:3000/${key}`,
                    originalUrl: values[i],
                }));
                results.push(...data);
            }
        }
        if (results.length === 0) {
            return res.status(200).send("No Keys Found");
        }

        return res.status(200).json(results);
    } catch (err) {
        console.error("Error fetching data:", err);
        return res.status(500).send("INTERNAL SERVER ERROR");
    }
});


app.get('/:shortId', async (req, res) => {
    const { shortId } = req.params;
    const redisClient = getRedisClient(shortId);
  
    try {
      const url = await redisClient.get(shortId);
      if (!url) {
        console.log(`Cache miss for key: ${shortId}`);
        return res.status(404).send("URL not found");
      }
      console.log(`Cache hit for key: ${shortId}`);
      res.redirect(url);
    } catch (err) {
      console.error("Redis error:", err);
      res.status(500).send("Server error");
    }
  });
  

app.listen(process.env.PORT, async() => {
    console.log(`Server running on port ${process.env.PORT}`)
    await Promise.all(redisClients.map(client => client.connect())); 
})
