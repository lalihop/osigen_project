import re
from services.crawler.searchengine import SearchEngine

class SearchGoogle(SearchEngine):
    def __init__(self, word):
        self.domain = word
        self.totalhosts = []

    async def do_search(self):
        for page in range(0, 3):
            url = f"https://www.google.com/search?q=site:{self.domain}&start={page * 10}"
            response = await self.fetch(url)
            if not response:
                print("[!] Google 응답 없음")
                continue

            matches = re.findall(r'<cite.*?>(.*?)</cite>', response)
            for match in matches:
                clean = re.sub(r'<.*?>', '', match)
                clean = clean.strip()
                if self.domain in clean and "*" not in clean:
                    self.totalhosts.append(clean)
