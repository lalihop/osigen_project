import aiohttp

class SearchEngine:
    def __init__(self):
        self.totalhosts = []
        self.user_agent = "Mozilla/5.0..."

    async def fetch(self, url, headers=None, method="GET", data=None, cookies=None):
        async with aiohttp.ClientSession() as session:
            if method == "POST":
                async with session.post(url, data=data, headers=headers, cookies=cookies) as resp:
                    return await resp.text()
            else:
                async with session.get(url, headers=headers, cookies=cookies) as resp:
                    return await resp.text()
                
    async def fetch_json(self, url, headers=None):
        async with aiohttp.ClientSession() as session:
            async with session.get(url, headers=headers) as resp:
                return await resp.json()