import re
from services.crawler.searchengine import SearchEngine

class SearchBing(SearchEngine):
    def __init__(self, word):
        self.domain = word
        self.totalhosts = []

    async def do_search(self):
        for page in range(0, 10):
            url = f"https://www.bing.com/search?q=site:{self.domain}&first={page * 10}"
            response = await self.fetch(url)
            if not response:
                break

            subdomains = re.findall(r'<cite>(.*?)</cite>', response)
            for item in subdomains:
                clean = item.strip().replace('<strong>', '').replace('</strong>', '')
                if self.domain in clean:
                    self.totalhosts.append(clean)
